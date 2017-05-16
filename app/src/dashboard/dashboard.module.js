angular.module('openDeskApp.dashboard', ['ngMaterial'])
        .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('dashboard', {
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
    });

};