'use strict'
import searchTemplate from './view/search.html'

angular.module('openDeskApp.search', [])
  .config(['$stateProvider', 'USER_ROLES', config])

function config ($stateProvider, USER_ROLES) {
  $stateProvider
    .state('search', {
      url: '/søg/:searchTerm',
      parent: 'site',
      views: {
        'content@': {
          template: searchTemplate,
          controller: 'SearchController'
        }
      },
      params: {
        authorizedRoles: [USER_ROLES.user]
      }
    })
}
