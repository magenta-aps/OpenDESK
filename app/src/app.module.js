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
        'openDeskApp.documents',
        'openDeskApp.administration',
        'openDeskApp.groups',
        'openDeskApp.users',
        //'openDeskApp.workflows',
        'openDeskApp.systemsettings',
        'openDeskApp.search',
        'openDeskApp.lool',
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

function config($stateProvider, $urlRouterProvider, $sceDelegateProvider, USER_ROLES) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'https://lool.magenta.dk:9980/**'
    ]);

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
    }).state('templateList', {
        parent: 'site',
        url: '/skabeloner',
        views: {
            'content@': {
                templateUrl: 'app/src/templates/view/templateList.html',
                controller: 'TemplatesController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    }).state('editTemplate', {
        parent: 'site',
        url: '/skabelon',
        views: {
            'content@': {
                templateUrl: 'app/src/templates/view/editTemplate.html',
                controller: 'TemplatesController',
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
        url: '/search',
        views: {
            'content@': {
                templateUrl: 'app/src/search/view/search.html',
                controller: 'SearchController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}

