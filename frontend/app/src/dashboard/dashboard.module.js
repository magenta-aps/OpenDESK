// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import dashboardTemplate from './view/dashboard.html'

angular.module('openDeskApp.dashboard', ['ngMaterial'])
  .config(['$stateProvider', 'USER_ROLES', config])

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
