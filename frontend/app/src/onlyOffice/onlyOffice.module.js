'use strict';

angular.module('openDeskApp.onlyOffice', ['ngMaterial'])
    .config(config);


function config($stateProvider, USER_ROLES) {

    $stateProvider.state('onlyOfficeEdit', {
        parent: 'site',
        url: '/onlyOffice/:nodeRef',
        views: {
            'content@': {
                templateUrl: 'app/src/onlyOffice/view/edit.html',
                controller: 'OnlyOfficeController',
                controllerAs: 'vm'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}