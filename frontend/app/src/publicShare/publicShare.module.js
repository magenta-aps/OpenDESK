'use strict'
import publicSharedDocumentTemplate from './view/publicSharedDocument.html'

angular.module('openDeskApp.publicShare', [])
  .config(['$stateProvider', config])

function config ($stateProvider) {
  $stateProvider.state('publicSharedDocument', {
    url: '/public/shared/:sharedId',
    views: {
      'body@': {
        template: publicSharedDocumentTemplate,
        controller: 'PublicShareController',
        controllerAs: 'PSC'
      }
    },
    params: {
      authorizedRoles: []
    }
  })
}
