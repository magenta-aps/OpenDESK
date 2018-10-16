'use strict'
import libreOfficeTemplate from './view/libreOffice.html'

angular
  .module('openDeskApp.libreOffice', [])
  .config(['$stateProvider', 'USER_ROLES', config])

function config ($stateProvider, USER_ROLES) {
  $stateProvider.state('libreOfficeEdit', {
    parent: 'site',
    url: '/edit/libreOffice/:nodeId',
    views: {
      'body@': {
        template: libreOfficeTemplate,
        controller: 'LibreOfficeEditController',
        controllerAs: 'LC'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  })
}
