angular
    .module('openDeskApp.documents', ['ngMaterial', 'pascalprecht.translate'])
    .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('document', {
        parent: 'site',
        url: '/dokument/:doc',
        params: {nodiref: null},
        views: {
            'content@': {
                templateUrl: 'app/src/documents/view/document.html',
                controller: 'DocumentController',
                controllerAs: 'vm'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    });

};