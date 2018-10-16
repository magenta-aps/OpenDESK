'use strict'
import libreOfficeTemplate from './view/libreOffice.html'

angular
  .module('openDeskApp.libreOffice', [])
  .config(['$stateProvider', 'USER_ROLES', config])

function config ($stateProvider, USER_ROLES) {
  $stateProvider.state('lool', {
    parent: 'site',
    url: '/lool/',
    params: {
      authorizedRoles: [USER_ROLES.user],
      nodeRef: null,
      versionLabel: null,
      parent: null,
      showArchived: null,
      backToDocPreview: null
    },
    views: {
      'body@': {
        template: libreOfficeTemplate,
        controller: 'LibreOfficeEditController',
        controllerAs: 'LC'
      }
    }
  })
}
