'use strict';

angular.module('openDeskApp.nogletal', ['ngMaterial'])
        .config(config);


function config($stateProvider, USER_ROLES) {

    $stateProvider.state('nogletal', {
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
    });

};