'use strict'
import documentsTemplate from './view/documents.html'
import filebrowserTemplate from '../filebrowser/view/filebrowser.html'

angular
  .module('openDeskApp.odDocuments', ['ngMaterial'])
  .config(config)

function config ($stateProvider, USER_ROLES) {
  $stateProvider.state('odDocuments', {
    parent: 'site',
    url: '/dokumenter',
    views: {
      'content@': {
        template: documentsTemplate
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    },
    redirectTo: 'odDocuments.myDocs'
  }).state('odDocuments.myDocs', {
    url: '/mine/{nodeRef:SlashFix}',
    views: {
      'filebrowser': {
        template: filebrowserTemplate,
        controller: 'FilebrowserController',
        controllerAs: 'vm'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user],
      selectedTab: 0,
      type: 'my-docs'
    }
  })
    .state('odDocuments.sharedDocs', {
      url: '/delte/{nodeRef:SlashFix}',
      views: {
        'filebrowser': {
          template: filebrowserTemplate,
          controller: 'FilebrowserController',
          controllerAs: 'vm'
        }
      },
      params: {
        authorizedRoles: [USER_ROLES.user],
        selectedTab: 1,
        type: 'shared-docs'
      }
    })
}
