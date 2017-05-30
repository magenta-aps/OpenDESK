angular.module('openDeskApp.search', ['ngMaterial', 'pascalprecht.translate'])
        .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('search', {
        url: '/search/:searchTerm',
        views: {
            'content@': {
                templateUrl: 'app/src/search/view/search.html'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    });

};