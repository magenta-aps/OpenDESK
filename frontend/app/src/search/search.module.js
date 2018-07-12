angular.module('openDeskApp.search', [])
  .config(config)

function config ($stateProvider, USER_ROLES) {
  $stateProvider
    .state('search', {
      url: '/søg/:searchTerm',
      parent: 'site',
      views: {
        'content@': {
          templateUrl: 'app/src/search/view/search.html',
          controller: 'SearchController'
        }
      },
      params: {
        authorizedRoles: [USER_ROLES.user]
      }
    })
}
