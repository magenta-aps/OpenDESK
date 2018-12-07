// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import onlyOfficeTemplate from './view/onlyOffice.html'

angular.module('openDeskApp.onlyOffice', ['ngMaterial'])
  .config(['$stateProvider', 'USER_ROLES', config])

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
