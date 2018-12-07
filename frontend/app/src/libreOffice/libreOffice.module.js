// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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
