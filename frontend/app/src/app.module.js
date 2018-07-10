'use strict'

import angular from 'angular'
import ngSanitize from 'angular-sanitize'
import ngMessages from 'angular-messages'
import ngMaterial from 'angular-material'
import ngCookies from 'angular-cookies'
import uiRouter from 'angular-ui-router'
import ngResource from 'angular-resource'

import init from './init.module'
import systemSettings from './system_settings/system-settings.module'
import backendConfig from './backendConfig.module'
import auth from './authentication/auth.module'
import sites from './odSite/site.module'
import groups from './group/group.module'
import discussions from './odDiscussion/discussion.module'
import notifications from './notifications/notifications.module'
import search from './search/search.module'
import dashboard from './dashboard/dashboard.module'
import documents from './documents/document.module'
import odDocuments from './odDocuments/documents.module'
import chat from './odChat/chat.module'
import user from './user/user.module'
import appDrawer from './appDrawer/appDrawer.module'
import lool from './lool/lool.module'
import onlyOffice from './onlyOffice/onlyOffice.module'
import header from './header/header.module'
// import translations from './i18n/translations.module'

angular
  .module('openDeskApp', [
    backendConfig,
    init,
    auth,
    ngSanitize,
    ngMaterial,
    ngMessages,
    ngCookies,
    uiRouter,
    'rt.encodeuri',
    ngResource,
    'pdf',
    'pdfjsViewer',
    'isteven-multi-select',
    systemSettings,
    groups,
    sites,
    'openDeskApp.translations.init',
    header,
    dashboard,
    lool,
    onlyOffice,
    documents,
    odDocuments,
    search,
    'm43nu.auto-height',
    'dcbImgFallback',
    notifications,
    discussions,
    chat,
    user,
    appDrawer,
    'dndLists',

    /* DO NOT REMOVE MODULES PLACEHOLDER!!! */ // openDesk-modules
    /* LAST */
    'openDeskApp.translations'
  ]) // TRANSLATIONS IS ALWAYS LAST!
  .config(config)
  .run(run)

function run ($rootScope, systemSettingsService, BROWSER_CONFIG, browserService) {
  $rootScope.isBoolean = function (value) {
    return typeof value === 'boolean'
  };

  ['isArray', 'isDate', 'isDefined', 'isFunction', 'isNumber', 'isObject', 'isString', 'isUndefined'].forEach(function (name) {
    $rootScope[name] = angular[name]
  })

  // If the LooL discovery file changes we can use this method to retrieve the updated list of mimetypes.
  // loolService.getValidMimeTypes().then(function(response) {
  //     EDITOR_CONFIG.lool.mimeTypes = response;
  // });

  systemSettingsService.loadPublicSettings()
    .then(function () {
      browserService.setTitle()
      BROWSER_CONFIG.isIE = browserService.isIE()
      BROWSER_CONFIG.isEdge = browserService.isEdge()
      BROWSER_CONFIG.isChrome = browserService.isChrome()
      BROWSER_CONFIG.isFirefox = browserService.isFirefox()
      BROWSER_CONFIG.isSafari = browserService.isSafari()
      BROWSER_CONFIG.isMac = browserService.isMac()
      BROWSER_CONFIG.isWin = browserService.isWin()
      BROWSER_CONFIG.isIOS = browserService.isIOS()
    })
}

function config ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $locationProvider,
  APP_CONFIG, USER_ROLES) {
  $urlMatcherFactoryProvider.type('SlashFix', { raw: true })

  // use the HTML5 History API
  $locationProvider.html5Mode(true).hashPrefix('!')

  $urlRouterProvider.when('', '/' + APP_CONFIG.landingPageUrl)

  $stateProvider.decorator('data', function (state, parent) {
    var stateData = parent(state)

    state.resolve = state.resolve || {}
    state.resolve.authorize = [
      'authService', '$q', 'sessionService', '$state', 'systemSettingsService', '$stateParams', 'APP_CONFIG',
      function (authService, $q, sessionService, $state, systemSettingsService, $stateParams, APP_CONFIG) {
        var d = $q.defer()

        if (authService.isAuthenticated())
          resolveUserAfterAuthorization($state, authService, $stateParams, systemSettingsService, APP_CONFIG, d)
        else if (APP_CONFIG.ssoLoginEnabled)
          authService.ssoLogin()
            .then(function () {
              if (authService.isAuthenticated())
                resolveUserAfterAuthorization($state, authService, $stateParams, systemSettingsService, APP_CONFIG, d)
              else
                rejectUnauthenticatedUser($state, sessionService, d)
            })
        else
          rejectUnauthenticatedUser($state, sessionService, d)
        return d.promise
      }
    ]
    return stateData
  })

  function resolveUserAfterAuthorization ($state, authService, $stateParams, systemSettingsService, APP_CONFIG, defer) {
    systemSettingsService.loadSettings()
      .then(function () {
        if (authService.isAuthorized($stateParams.authorizedRoles))
          defer.resolve(authService.user)
        else
          $state.go(APP_CONFIG.landingPageState)
      })
  }

  function rejectUnauthenticatedUser ($state, sessionService, defer) {
    defer.reject('Please login')
    sessionService.retainCurrentLocation()
    $state.go('login')
  }

  $stateProvider.state('site', {
    abstract: true,
    url: '',
    views: {
      'header@': {
        template: '<od-header></od-header>'
      },
      'sideNavs@': {
        template: '<od-chat></od-chat><od-notifications></od-notifications><od-user-panel></od-user-panel><od-app-drawer></od-app-drawer>'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  })
}
