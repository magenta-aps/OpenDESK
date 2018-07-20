'use strict'
import onlyOfficeTemplate from './view/onlyOffice.html'

angular.module('openDeskApp.onlyOffice', ['ngMaterial'])
  .config(config)

function config ($stateProvider, USER_ROLES) {
  $stateProvider.state('onlyOfficeEdit', {
    parent: 'site',
    url: '/edit/onlyOffice/:nodeRef',
    views: {
      'body@': {
        template: onlyOfficeTemplate,
        controller: 'OnlyOfficeEditController',
        controllerAs: 'vm'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  })
}
