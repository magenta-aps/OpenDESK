'use strict'
import dashboardTemplate from './view/dashboard.html'

angular.module('openDeskApp.dashboard', ['ngMaterial'])
  .config(config)

function config ($stateProvider, USER_ROLES) {
  $stateProvider.state('dashboard', {
    parent: 'site',
    url: '/',
    views: {
      'content@': {
        template: dashboardTemplate,
        controller: 'DashboardController',
        controllerAs: 'vm'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  })
}
