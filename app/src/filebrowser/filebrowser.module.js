angular.module('openDeskApp.filebrowser', ['ngMaterial'])
.config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('filebrowser', {
        parent: 'site',
        url: '/dokumenter{path:.*}',
        params: {
            authorizedRoles: [USER_ROLES.user],
            isSite: false
        },
        views: {
            'content@': {
                templateUrl: 'app/src/filebrowser/view/filebrowserCard.html',
                controller: 'FilebrowserController',
                controllerAs: 'fc'
            }
        }
    });

}