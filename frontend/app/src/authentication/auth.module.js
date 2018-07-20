'use strict'
import loginTemplate from './view/login.html'

angular.module('openDeskApp.auth', [])
  .config(config)

function config ($stateProvider) {
  $stateProvider.state('login', {
    url: '/login',
    views: {
      'content@': {
        template: loginTemplate,
        controller: 'AuthController',
        controllerAs: 'vm'
      }
    },
    params: {
      authorizedRoles: []
    }
  })
};
