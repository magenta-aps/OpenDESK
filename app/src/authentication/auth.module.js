'use strict';

angular.module('openDeskApp.auth', ['ngMaterial'])
        .config(config);


function config($stateProvider, USER_ROLES) {

    $stateProvider.state('login', {
        url: '/login',
        views: {
            'content@': {
                templateUrl: 'app/src/authentication/view/login.html',
                controller: 'AuthController',
                controllerAs: 'vm'
            },
            'header@': {},
            'footer@': {}
        },
        params: {
            authorizedRoles: []
        }
    });

};