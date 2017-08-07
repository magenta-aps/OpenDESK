'use strict';

angular.module('openDeskApp.sites', ['ngMaterial', 'fixed.table.header'])
        .config(config);


function config($stateProvider, USER_ROLES) {

    $stateProvider.state('projects', {
        parent: 'site',
        url: '/projekter',
        views: {
            'content@': {
                templateUrl: 'app/src/sites/view/sites.html',
                controller: 'SitesController',
                controllerAs: 'vm'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }
    });

}