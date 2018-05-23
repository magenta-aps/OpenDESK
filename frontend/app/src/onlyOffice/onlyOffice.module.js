'use strict';

angular.module('openDeskApp.onlyOffice', ['ngMaterial'])
    .config(config);


function config($stateProvider, USER_ROLES) {

    $stateProvider.state('onlyOfficeEdit', {
        url: '/edit/onlyOffice/:nodeRef',
        views: {
            'body@': {
                templateUrl: 'app/src/onlyOffice/view/onlyOffice.html',
                controller: 'OnlyOfficeEditController',
                controllerAs: 'vm'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }
    });
}