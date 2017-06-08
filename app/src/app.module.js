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
        'openDeskApp.pd_sites',
        'openDeskApp.translations.init',
        'openDeskApp.header',
        'openDeskApp.dashboard',
        'openDeskApp.lool',
        'openDeskApp.documents',
        'openDeskApp.administration',
        'openDeskApp.groups',
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
        var ssoLoginEnabled = APP_CONFIG.ssoLoginEnabled == "true";
        angular.element(window.document)[0].title = APP_CONFIG.appName;
        $rootScope.appName = APP_CONFIG.appName;
        $rootScope.logoSrc = APP_CONFIG.logoSrc;

        if (!authService.isAuthenticated()) {
            if (ssoLoginEnabled) {
                authService.ssoLogin().then(function (response) {
                    if (!authService.isAuthenticated()) {
                        sessionService.retainCurrentLocation();
                        $state.go('login');
                    }
                    else
                        $state.reload();
                });
            }
        }
    });

function config($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
        .when('/admin/system-settings', '/admin/system-settings/general-configuration')
        .otherwise('/');

    $stateProvider.state('site', {
        abstract: true,
        resolve: {
            authorize:
                ['authService', '$q', 'sessionService', '$state', function (authService, $q, sessionService, $state) {
                var d = $q.defer();
                if (authService.isAuthenticated()) {
                    // I also provide the user for child controllers
                    d.resolve(authService.user);
                } else {
                    // here the rejection
                    d.reject('not logged');
                    sessionService.retainCurrentLocation();
                    $state.go('login');
                }
                return d.promise;
            }]
        },
        views: {
            'footer@': {
                templateUrl: 'app/src/footer/view/footer.html',
                controller: 'FooterController'
            },
            'header@': {
                templateUrl: 'app/src/header/view/header.html'
            }
        }
    });
}

