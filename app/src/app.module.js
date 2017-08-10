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
        'openDeskApp.auth',
        'openDeskApp.sites',
        'openDeskApp.site',
        'openDeskApp.filebrowser',
        'openDeskApp.translations.init',
        'openDeskApp.header',
        'openDeskApp.dashboard',
        'openDeskApp.lool',
        'openDeskApp.documents',
        'openDeskApp.users',
        'openDeskApp.systemsettings',
        'openDeskApp.search',
        'openDeskApp.calendar',
        'openDeskApp.nogletal',

        'openDeskApp.common.directives',
        'openDeskApp.common.directives.filter',
        'm43nu.auto-height',
        'dcbImgFallback',
        'openDeskApp.notifications',
        'openDeskApp.discussion',
        'openDeskApp.chat',
        'openDeskApp.user',
        'openDeskApp.menu',

        /*DO NOT REMOVE MODULES PLACEHOLDER!!!*/ //openDesk-modules
        /*LAST*/ 'openDeskApp.translations']) //TRANSLATIONS IS ALWAYS LAST!
    .config(config)
    .run(function ($rootScope, $transitions, $state, $mdDialog, authService, sessionService, APP_CONFIG) {
        $rootScope.ssoLoginEnabled = APP_CONFIG.ssoLoginEnabled == "true";
        angular.element(window.document)[0].title = APP_CONFIG.appName;
        $rootScope.appName = APP_CONFIG.appName;
        $rootScope.logoSrc = APP_CONFIG.logoSrc;
        if($state.current.url == "^")
            $state.go(APP_CONFIG.landingPage);
    });

function config($stateProvider, USER_ROLES) {

    $stateProvider.decorator('data', function(state, parent) {
        var stateData = parent(state);

        state.resolve = state.resolve || {};
        state.resolve.authorize = [
            'authService', '$q', 'sessionService', '$state', '$rootScope', '$stateParams', 'APP_CONFIG',
            function (authService, $q, sessionService, $state, $rootScope, $stateParams, APP_CONFIG) {
                var d = $q.defer();

                if (authService.isAuthenticated())
                    resolveUserAfterAuthorization($state, authService, $stateParams, APP_CONFIG, d);

                else if ($rootScope.ssoLoginEnabled) {
                    authService.ssoLogin().then(function (response) {
                        if (authService.isAuthenticated())
                            resolveUserAfterAuthorization($state, authService, $stateParams, APP_CONFIG, d);
                        else rejectUnauthenticatedUser($state, sessionService, d);
                    });
                }

                else rejectUnauthenticatedUser($state, sessionService, d);

                return d.promise;
            }];
        return stateData;
    });

    function resolveUserAfterAuthorization($state, authService, $stateParams, APP_CONFIG, defer) {
        if (authService.isAuthorized($stateParams.authorizedRoles))
            defer.resolve(authService.user);
        else
            $state.go(APP_CONFIG.landingPage);
    }

    function rejectUnauthenticatedUser($state, sessionService, defer) {
        defer.reject('Please login');
        sessionService.retainCurrentLocation();
        $state.go('login');
    }

    $stateProvider.state('site', {
        abstract: true,
        views: {
            'header@': {
                templateUrl: 'app/src/header/view/header.html'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}

