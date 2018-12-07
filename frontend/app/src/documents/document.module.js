// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/directives/breadcrumb'
import documentTemplate from './view/document.html'
import editDocumentTemplate from './view/editDocument.html'
import documentActionsTemplate from './action/action.html'
import documentHistoryTemplate from './history/history.html'
import documentReviewTemplate from './review/review.html'

angular
  .module('openDeskApp.documents', ['od.review'])
  .config(['$stateProvider', 'USER_ROLES', config])
  .component('documentActions', {
    template: documentActionsTemplate,
    controller: 'DocumentActionController',
    controllerAs: 'DAC',
    bindings: {
      doc: '<'
    }
  })
  .component('documentHistory', {
    template: documentHistoryTemplate,
    bindings: {
      history: '<',
      selectedVersion: '<'
    }
  })
  .component('documentReview', {
    template: documentReviewTemplate,
    bindings: {
      reviewId: '<'
    }
  })

function config ($stateProvider, USER_ROLES) {
  $stateProvider.state('document', {
    parent: 'site',
    url: '/dokument/:doc?reviewId&versionId&version',
    views: {
      'content@': {
        template: documentTemplate,
        controller: 'DocumentController',
        controllerAs: 'DC'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  }).state('editDocument', {
    parent: 'site',
    url: '/dokument/:doc/edit',
    views: {
      'content@': {
        template: editDocumentTemplate,
        controller: 'DocumentController',
        controllerAs: 'DC'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  })
}
