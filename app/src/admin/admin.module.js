angular.module('openDeskApp.administration', ['ngMaterial', 'pascalprecht.translate'])
        .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('administration', {
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
    })

};