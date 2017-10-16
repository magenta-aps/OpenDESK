angular
    .module('openDeskApp', [
        'ngSanitize',
        'ngMaterial',
        'ngMessages',
        'ngCookies',
        'material.wizard',
        'ui.router',
        'rt.encodeuri',
        'ngResource',
        'pdf',
        'swfobject',
        'isteven-multi-select',
        'openDeskApp.init',
        'openDeskApp.systemsettings',
        'openDeskApp.auth',
        'site.list',
        'site.detail',
        'openDeskApp.sites',
        'openDeskApp.filebrowser',
        'openDeskApp.translations.init',
        'openDeskApp.header',
        'openDeskApp.dashboard',
        'openDeskApp.lool',
        'openDeskApp.documents',
        'openDeskApp.search',
        'openDeskApp.calendar',
        'openDeskApp.nogletal',
        'm43nu.auto-height',
        'dcbImgFallback',
        'openDeskApp.notifications',
        'openDeskApp.discussion',
        'openDeskApp.chat',
        'openDeskApp.user',
        'openDeskApp.appDrawer',

        /*DO NOT REMOVE MODULES PLACEHOLDER!!!*/ //openDesk-modules
        /*LAST*/ 'openDeskApp.translations']) //TRANSLATIONS IS ALWAYS LAST!
    .config(config)
    .run(function ($rootScope, $transitions, $state, $mdDialog, authService, sessionService, systemSettingsService,
                   APP_CONFIG, CLIENT_CONFIG, EDITOR_CONFIG, browserService, loolService) {

        $rootScope.isBoolean = function(value) {
            return typeof value === 'boolean';
        };

        ['isArray', 'isDate', 'isDefined', 'isFunction', 'isNumber', 'isObject', 'isString', 'isUndefined'].forEach(function(name) {
            $rootScope[name] = angular[name];
        });

        loolService.getValidMimeTypes().then(function(response) {
            EDITOR_CONFIG.lool.mimeTypes = response;
        });

        systemSettingsService.loadPublicSettings().then(function(response) {
            browserService.setTitle();
            $rootScope.appName = APP_CONFIG.settings.appName;
            $rootScope.logoSrc = APP_CONFIG.settings.logoSrc;
            CLIENT_CONFIG.browser.isIE = detectIE();
        });
    });

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) { return true; }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) { return true; }

    // We don't accept Edge, as Edge does not support ActiveXObject
    //var edge = ua.indexOf('Edge/');
    //if (edge > 0) { return true; }

    // other browser
    return false;
}

function config($stateProvider, $urlRouterProvider, APP_CONFIG, USER_ROLES) {

    $urlRouterProvider.when('', '/' + APP_CONFIG.landingPageUrl);

    $stateProvider.decorator('data', function(state, parent) {
        var stateData = parent(state);

        state.resolve = state.resolve || {};
        state.resolve.authorize = [
            'authService', '$q', 'sessionService', '$state', 'systemSettingsService', '$stateParams', 'APP_CONFIG',
            function (authService, $q, sessionService, $state, systemSettingsService, $stateParams, APP_CONFIG) {
                var d = $q.defer();

                if (authService.isAuthenticated())
                    resolveUserAfterAuthorization($state, authService, $stateParams, systemSettingsService, APP_CONFIG, d);

                else if (APP_CONFIG.ssoLoginEnabled) {
                    authService.ssoLogin().then(function (response) {
                        if (authService.isAuthenticated())
                            resolveUserAfterAuthorization($state, authService, $stateParams, systemSettingsService,
                                APP_CONFIG, d);
                        else rejectUnauthenticatedUser($state, sessionService, d);
                    });
                }

                else rejectUnauthenticatedUser($state, sessionService, d);

                return d.promise;
            }];
        return stateData;
    });

    function resolveUserAfterAuthorization($state, authService, $stateParams, systemSettingsService, APP_CONFIG, defer) {
        systemSettingsService.loadSettings().then(function(response) {
            if (authService.isAuthorized($stateParams.authorizedRoles))
                defer.resolve(authService.user);
            else
                $state.go(APP_CONFIG.landingPageState);
        });
    }

    function rejectUnauthenticatedUser($state, sessionService, defer) {
        defer.reject('Please login');
        sessionService.retainCurrentLocation();
        $state.go('login');
    }

    $stateProvider.state('site', {
        abstract: true,
        url: '',
        views: {
            'header@': {
                template: '<od-header></od-header>'
            },
            'sideNavs@': {
                template: '<od-chat></od-chat><od-notifications></od-notifications><od-user></od-user><od-app-drawer></od-app-drawer>'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}

