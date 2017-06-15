angular.module('openDeskApp.search', ['ngMaterial', 'pascalprecht.translate'])
        .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('search', {
        url: '/søg/:searchTerm',
        views: {
            'content@': {
                templateUrl: 'app/src/search/view/search.html',
                controller: 'SearchController'
            }
        },
        data: {
            authorizedRoles: [USER_ROLES.user]
        }
    });

};