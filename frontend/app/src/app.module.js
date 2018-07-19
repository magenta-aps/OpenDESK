'use strict'

angular
  .module('openDeskApp', [
    'ngSanitize',
    'ngMaterial',
    'ngMessages',
    'ngCookies',
    'ui.router',
    'pascalprecht.translate',
    'ngResource',
    'swfobject',
    'isteven-multi-select',
    'm43nu.auto-height',
    'dcbImgFallback',
    'dndLists',
    'openDeskApp.backendConfig',
    'openDeskApp.init',
    'openDeskApp.systemsettings',
    'openDeskApp.auth',
    'openDeskApp.group',
    'openDeskApp.site',
    'openDeskApp.filebrowser',
    'openDeskApp.header',
    'openDeskApp.dashboard',
    'openDeskApp.lool',
    'openDeskApp.onlyOffice',
    'openDeskApp.documents',
    'openDeskApp.odDocuments',
    'openDeskApp.search',
    'openDeskApp.notifications',
    'openDeskApp.discussion',
    'openDeskApp.user',
    'openDeskApp.appDrawer',

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
