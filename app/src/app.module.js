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
        'openDeskApp.sites',
        'openDeskApp.pd_sites',
        'openDeskApp.translations.init',
        'openDeskApp.header',
        'openDeskApp.dashboard',
        'openDeskApp.lool',
        'openDeskApp.documents',
        'openDeskApp.administration',
        'openDeskApp.groups',
        'openDeskApp.users',
        //'openDeskApp.workflows',
        'openDeskApp.systemsettings',
        'openDeskApp.search',

        'openDeskApp.testdata',

        //'openDeskApp.templates',

        'openDeskApp.common.directives',
        'openDeskApp.common.directives.filter',
        'm43nu.auto-height',
        'dcbImgFallback',
        'openDeskApp.notifications',
        'openDeskApp.chat',
        'openDeskApp.user',
        'openDeskApp.menu',

        /*DO NOT REMOVE MODULES PLACEHOLDER!!!*/ //openDesk-modules
        /*LAST*/ 'openDeskApp.translations']) //TRANSLATIONS IS ALWAYS LAST!
    .config(config)
    .run(function ($rootScope, $state, $mdDialog, authService, sessionService, APP_CONFIG) {
        var ssoLoginEnabled = APP_CONFIG.ssoLoginEnabled == "true";
        angular.element(window.document)[0].title = APP_CONFIG.appName;
        $rootScope.appName = APP_CONFIG.appName;
        $rootScope.logoSrc = APP_CONFIG.logoSrc;

        $rootScope.$on('$stateChangeStart', function (event, next, params) {
            $rootScope.toState = next;
            $rootScope.toStateParams = params;
            if (next.data.authorizedRoles.length === 0) {
                return;
            }
            // If we got any open dialogs, close them before route change
            $mdDialog.cancel();
        });
        if (!authService.isAuthenticated()) {
            if(ssoLoginEnabled) {
                authService.ssoLogin().then(function (response) {
                    if (!authService.isAuthenticated()) {
                        event.preventDefault();
                        sessionService.retainCurrentLocation();
                        $state.go('login');
                    }
                    else
                        $state.reload();
                });
            }
            else if (!authService.isAuthenticated()) {
                event.preventDefault();
                sessionService.retainCurrentLocation();
                $state.go('login');
            }
        }
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
    }).state('administration', {
        parent: 'site',
        url: '/indstillinger',
        views: {
            'content@': {
                templateUrl: 'app/src/admin/view/admin.html',
                controller: 'AdminController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('kalendar', {
        parent: 'site',
        url: '/kalendar',
        views: {
            'content@': {
                templateUrl: 'app/src/kalendar/view/kalendar.html'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('nogletal', {
        parent: 'site',
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
            },
            'header@': {},
            'footer@': {}
        },
        data: {
            authorizedRoles: []
        }
    }).state('projects', {
        parent: 'site',
        url: '/projekter',
        views: {
            'content@': {
                templateUrl: 'app/src/sites/view/sites.html',
                controller: 'SitesController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('testdata', {
        parent: 'site',
        url: '/testdata',
        views: {
            'content@': {
                //templateUrl: 'app/src/sites/view/sites.html',
                controller: 'TestController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('project', {
        parent: 'site',
        url: '/projekter/:projekt{path:.*}',
        views: {
            'content@': {
                templateUrl: 'app/src/sites/view/site.html',
                controller: 'SiteController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user],
            selectedTab: 0
        }

    }).state('testuser', {
        parent: 'site',
        url: '/testuser',
        views: {
            'content@': {
                templateUrl: 'app/src/users/view/test.html',
                controller: 'UsersController'
            }
        }

    }).state('search', {
        url: '/search/:searchTerm',
        views: {
            'content@': {
                templateUrl: 'app/src/search/view/search.html'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}

