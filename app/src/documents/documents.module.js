angular
    .module('openDeskApp.documents', ['ngMaterial', 'pascalprecht.translate'])
    .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('document', {
        parent: 'site',
        url: '/dokument/:doc',
        views: {
            'content@': {
                templateUrl: 'app/src/documents/view/document.html',
                controller: 'DocumentController',
                controllerAs: 'vm'
            }
        },
        params: {
            nodiref: null,
            authorizedRoles: [USER_ROLES.user]
        }
    });

};