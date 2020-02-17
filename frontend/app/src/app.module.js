//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp', [
    'ngSanitize',
    'ngMaterial',
    'ngMessages',
    'ngCookies',
    'ui.router',
    'pascalprecht.translate',
    'angular-translate-loader-pluggable',
    'ngResource',
    'dndLists',
    'angular.img',
    'openDeskApp.backendConfig',
    'openDeskApp.init',
    'openDeskApp.systemsettings',
    'openDeskApp.auth',
    'openDeskApp.group',
    'openDeskApp.site',
    'openDeskApp.filebrowser',
    'openDeskApp.header',
    'openDeskApp.appDrawer',
    'openDeskApp.dashboard',
    'openDeskApp.libreOffice',
    'openDeskApp.onlyOffice',
    'openDeskApp.metadata',
    'openDeskApp.documents',
    'openDeskApp.odDocuments',
    'openDeskApp.search',
    'openDeskApp.searchBar',
    'openDeskApp.notifications',
    'openDeskApp.discussion',
    'openDeskApp.user',
    // 'openDeskApp.chat', Not added because it has not been maintained and converse is not managed by npm
    'openDeskApp.members',
    'openDeskApp.publicShare',
    'odEmail',

    /* DO NOT REMOVE MODULES PLACEHOLDER!!! */ // openDesk-modules
    /* LAST */
    'openDeskApp.translations'
  ]) // TRANSLATIONS IS ALWAYS LAST!
  .config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', '$locationProvider',
    'APP_CONFIG', 'USER_ROLES', config])
  .run(['$rootScope', 'systemSettingsService', 'BROWSER_CONFIG', 'browserService', run])

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
      'authService', '$q', 'editorService', 'sessionService', '$state', 'systemSettingsService', '$stateParams',
      'APP_CONFIG',
      function (authService, $q, editorService, sessionService, $state, systemSettingsService, $stateParams,
        APP_CONFIG) {
        function checkAuthorization () {
          editorService.loadEditors()
          systemSettingsService.loadSettings()
            .then(function () {
              if (authService.isAuthorized($stateParams.authorizedRoles))
                defer.resolve(authService.user)
              else
                $state.go(APP_CONFIG.landingPageState)
            })
        }

        var defer = $q.defer()
        // SSO is enabled and the user has just logged in
        // We need to get info about the user before we check authorization
        if (APP_CONFIG.ssoLoginEnabled && !authService.isAuthenticated()) {
          authService.ssoLogin()
            .then(function () {
              checkAuthorization()
              return defer.promise
            })
        } else if (authService.isAuthenticated()) {
          // The user is authenticated. Now we check if the user is authorized to view this page
          checkAuthorization()
        } else {
          // The user is not authenticated
          defer.reject('Please login')
          sessionService.retainCurrentLocation()
          $state.go('login', {

            // This is a hack - remove retainCurrentLocation function instead and that stuff instead...

            redirectUrl: sessionService.getRetainedLocation()
          })
        }
        return defer.promise
      }
    ]
    return stateData
  })

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
