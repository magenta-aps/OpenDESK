// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/filters/openeDateFilter'
import documentsTemplate from './view/documents.html'
import filebrowserTemplate from '../filebrowser/view/filebrowser.html'

angular
  .module('openDeskApp.odDocuments', ['ngMaterial'])
  .config(['$stateProvider', 'USER_ROLES', config])

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
