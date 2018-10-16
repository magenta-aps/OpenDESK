'use strict'
import loolTemplate from './view/lool.html'

angular
  .module('openDeskApp.lool', [])
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
        template: loolTemplate,
        controller: 'LoolController',
        controllerAs: 'LC'
      }
    }
  })
}
