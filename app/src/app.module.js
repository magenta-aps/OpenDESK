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
    });

function config($stateProvider) {

    $stateProvider.state('site', {
        abstract: true,
        resolve: {
            authorize:
                ['authService', '$q', 'sessionService', '$state', '$rootScope', '$stateParams',
                    function (authService, $q, sessionService, $state, $rootScope, $stateParams) {
                var d = $q.defer();
                if (authService.isAuthenticated() && authService.isAuthorized($stateParams.authorizedRoles)) {
                    // I also provide the user for child controllers
                    d.resolve(authService.user);
                } else {
                    // here the rejection
                    if ($rootScope.ssoLoginEnabled) {
                        authService.ssoLogin().then(function (response) {
                            if (authService.isAuthenticated() && authService.isAuthorized($stateParams.authorizedRoles))
                                d.resolve(authService.user);
                            else {
                                d.reject('Not logged in or lacking authorization!');
                                sessionService.retainCurrentLocation();
                                $state.go('login');
                            }
                        });
                    }
                    else {
                        d.reject('Not logged in or lacking authorization!');
                        sessionService.retainCurrentLocation();
                        $state.go('login');
                    }
                }
                return d.promise;
            }]
        },
        views: {
            'header@': {
                templateUrl: 'app/src/header/view/header.html'
            }
        }
    });
}

