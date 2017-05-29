'use strict';

angular.module('openDeskApp.calendar', ['ngMaterial'])
        .config(config);


function config($stateProvider, USER_ROLES) {

    $stateProvider.state('kalendar', {
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
    });

};