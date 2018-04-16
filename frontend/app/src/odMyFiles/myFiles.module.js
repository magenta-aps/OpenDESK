'use strict';

angular
    .module('openDeskApp.myFiles', ['ngMaterial'])
    .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('myFiles', {
        parent: 'site',
        url: '/mine-dokumenter',
        views: {
            'content@': {
                templateUrl: 'app/src/odMyFiles/view/myFiles.html',
                controller: 'MyFilesController',
                controllerAs: 'vm'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}