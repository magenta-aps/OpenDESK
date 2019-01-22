//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import fundTemplate from './view/fund.html'
import dashboardTemplate from '../dashboard/view/dashboard.html'
import fundMenu from './fundMenu/fundMenu.view.html'
import fundList from './fundList/fundList.view.html'
import fundApplication from './fundApplication/fundApplication.view.html'

angular.module('openDeskApp.fund', ['openDeskApp.discussion'])
  .config(['$stateProvider', config])

function config ($stateProvider) {
  $stateProvider.state('fund', {
    parent: 'site',
    url: '/fondsansogninger',
    views: {
      'content@': {
        template: fundTemplate,
      },
      'fundMain@fund': {
        template: dashboardTemplate,
        controller: 'FundController',
        controllerAs: 'vm'
      },
      'fundHeader@fund': {
        template: fundMenu,
        controller: 'FundMenuController',
        controllerAs: 'vm'
      }
    }
  })
  .state('fund.flow', {
    url: '/:flow', // @TODO: This should match the path inside fund.config.js - we should make this generic
    views: {
      'fundMain@fund': {
        template: fundList,
        controller: 'FundListController',
        controllerAs: 'vm'
      }
    }
  })
  .state('fund.flow.application', {
    url: '/:id',
    views: {
      'fundMain@fund': {
        template: fundApplication,
        controller: 'FundApplicationController',
        controllerAs: 'vm'
      },
      'application@fund.flow.application': {
        template: '<application-block ng-repeat="block in application.blocks" block="block"/>'
      }
    },
    params: {
      currentAppPage: 'application'
    }
  })
  .state('fund.flow.application.contact', {
    url: '/contact',
    views: {
      'application@fund.flow.application': {
        template: '<md-card><md-card-content><strong>Ansøger</strong> Assentofthallen<br/><strong>Kontaktperson</strong> Navn Navnsen</strong><br/><strong>E-mail</strong> navn@navnsen.dk<br/><strong>Telefon</strong> 21 22 23 24</md-card-content></md-card>'
      }
    },
    params: {
      currentAppPage: 'contact'
    }
  })
  .state('fund.flow.application.comments', {
    url: '/comments',
    views: {
      'application@fund.flow.application': {
        template: '<md-card><md-card-content>Comments</md-card-content></md-card>'
      }
    },
    params: {
      currentAppPage: 'comments'
    }
  })
  .state('fund.flow.application.history', {
    url: '/history',
    views: {
      'application@fund.flow.application': {
        template: '<md-card><md-card-content>Versionshistorik</md-card-content></md-card>'
      }
    },
    params: {
      currentAppPage: 'history'
    }
  })
}
