// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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
