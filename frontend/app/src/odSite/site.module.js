// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import 'angular-fixed-table-header'
import siteListTemplate from './siteList/siteList.view.html'
import siteDetailTemplate from './siteDetail/siteDetail.view.html'
import filebrowserTemplate from '../filebrowser/view/filebrowser.html'

angular.module('openDeskApp.site', ['openDeskApp.filebrowser', 'fixed.table.header'])
  .config(['$stateProvider', 'APP_CONFIG', 'USER_ROLES', config])

function config ($stateProvider, APP_CONFIG, USER_ROLES) {
  $stateProvider.state('siteList', {
    parent: 'site',
    url: '/' + APP_CONFIG.sitesUrl,
    views: {
      'content@': {
        template: siteListTemplate,
        controller: 'SiteListController',
        controllerAs: 'vm'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  })
    .state('project', {
      parent: 'site',
      url: '/' + APP_CONFIG.sitesUrl + '/:projekt',
      views: {
        'content@': {
          template: siteDetailTemplate,
          controller: 'SiteDetailController',
          controllerAs: 'vm'
        }
      },
      params: {
        authorizedRoles: [USER_ROLES.user],
        path: ''
      },
      redirectTo: 'project.filebrowser'
    })
    .state('project.filebrowser', {
      url: '/dokumenter/{nodeRef:SlashFix}',
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
        type: 'site'
      }
    })
}
