'use strict';
angular
    .module('openDeskApp.lool', ['ngMaterial', 'pascalprecht.translate'])
    .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('lool', {
        parent: 'site',
        url: '/lool/',
        params: {nodeRef: null},
        views: {
            'content@': {
                templateUrl: 'app/src/lool/view/lool.html',
                controller: 'LoolController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}