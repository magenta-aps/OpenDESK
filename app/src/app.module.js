angular
    .module('openDeskApp', [
        'ngSanitize',
        'ngMaterial',
        'ngMessages',
        'material.wizard',
        'ui.router',
        'rt.encodeuri',
        'ngResource',
        'pdf',
        'swfobject',
        'isteven-multi-select',
        'openDeskApp.init',
        //'openDeskApp.projects',
        'openDeskApp.translations.init',
        'openDeskApp.header',
        'openDeskApp.dashboard',
        //'openDeskApp.files',
        //'openDeskApp.tasks',
        'openDeskApp.documents',
        'openDeskApp.administration',
        'openDeskApp.groups',
        'openDeskApp.users',
        //'openDeskApp.workflows',
        'openDeskApp.systemsettings',
        'openDeskApp.search',
        'openDeskApp.common.directives',
        'openDeskApp.common.directives.filter',
        'm43nu.auto-height',
        'dcbImgFallback',
        'openDeskApp.documentation',
				'openDeskApp.projekter',
        /*DO NOT REMOVE MODULES PLACEHOLDER!!!*/ //openDesk-modules
        /*LAST*/ 'openDeskApp.translations'])// TRANSLATIONS IS ALWAYS LAST!
    .config(config)
    .run(function ($rootScope, $state, $mdDialog, authService, sessionService, APP_CONFIG) {
        angular.element(window.document)[0].title = APP_CONFIG.appName;
        $rootScope.appName = APP_CONFIG.appName;
        $rootScope.logoSrc = APP_CONFIG.logoSrc;

        $rootScope.$on('$stateChangeStart', function (event, next, params) {
            $rootScope.toState = next;
            $rootScope.toStateParams = params;
            if (next.data.authorizedRoles.length === 0) {
                return;
            }

            if (authService.isAuthenticated() && authService.isAuthorized(next.data.authorizedRoles)) {
                //We do nothing. Attempting to transition to the actual state results in call stack exception
            } else {
                event.preventDefault();
                sessionService.retainCurrentLocation();
                $state.go('login');
            }

            // If we got any open dialogs, close them before route change
            $mdDialog.cancel();
        });
    });

function config($stateProvider, $urlRouterProvider, USER_ROLES) {

    $urlRouterProvider
        .when('/admin/system-settings', '/admin/system-settings/general-configuration')
        .otherwise('/');

    $stateProvider.state('site', {
        abstract: true,
        resolve: {
            authorize: ['authService', function (authService) {
            }]
        }
    }).state('dashboard', {
        parent: 'site',
        url: '/',
        views: {
            'content@': {
                templateUrl: 'app/src/dashboard/view/dashboard.html',
                controller: 'DashboardController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('documentation', {
        parent: 'site',
        url: '/documentation',
        views: {
            'content@': {
                templateUrl: 'app/src/documentation/view/documentation.html',
                controller: 'DocumentationController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('kalendar', {
        url: '/kalendar',
        views: {
            'content@': {
                templateUrl: 'app/src/kalendar/view/kalendar.html'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('projekter', {
        url: '/projekter',
        views: {
            'content@': {
                templateUrl: 'app/src/projekter/view/projekter.html',
                controller: 'ProjekterController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('nogletal', {
        url: '/nogletal',
        views: {
            'content@': {
                templateUrl: 'app/src/nogletal/view/nogletal.html'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('login', {
        parent: 'site',
        url: '/login?error&nosso',
        views: {
            'content@': {
                templateUrl: 'app/src/authentication/view/login.html',
                controller: 'AuthController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: []
        }
    });
}