//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import fund from './view/fund.html'
import fundWorkflowList from './fundWorkflowList/fundWorkflowList.view.html'
import fundWorkflowStateMenu from './fundWorkflowStateMenu/fundWorkflowStateMenu.view.html'
import fundApplicationList from './fundApplicationList/fundApplicationList.view.html'
import fundApplication from './fundApplication/fundApplication.view.html'
import fundApplicationBlocks from './fundApplicationBlocks/fundApplicationBlocks.view.html'
import fundApplicationHistory from './fundApplicationHistory/fundApplicationHistory.view.html'
import fundApplicationBudget from './fundApplicationBudget/fundApplicationBudget.view.html'

angular.module('openDeskApp.fund', ['openDeskApp.discussion'])
  .config(['$stateProvider', 'USER_ROLES', config])

function config ($stateProvider, USER_ROLES) {
  $stateProvider.state('fund', {
    parent: 'site',
    url: '/fondsansogninger',
    views: {
      'content@': {
        template: fund,
        controller: 'FundController',
        controllerAs: 'vm'
      },
      'fundMain@fund': {
        template: fundWorkflowList,
        controller: 'FundWorkflowListController',
        controllerAs: 'vm'
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  })
  .state('fund.workflow', {
    url: '/workflow/:workflowID',
    views: {
      'fundMain@fund': {
        template: fundApplicationList,
        controller: 'FundApplicationListController',
        controllerAs: 'vm'
      },
      'fundHeader@fund': {
        template: fundWorkflowStateMenu
      }
    },
    params: {
      stateID: null
    },
  })
  .state('fund.incoming', {
    url: '/incoming',
    views: {
      'fundMain@fund': {
        template: fundApplicationList,
        controller: 'FundIncomingListController',
        controllerAs: 'vm'
      }
    }
  })
  .state('fund.application', {
    url: '/application/:applicationID',
    views: {
      'fundMain@fund': {
        template: fundApplication,
        controller: 'FundApplicationController',
        controllerAs: 'vm'
      },
      'fundHeader@fund': {
        template: fundWorkflowStateMenu
      },
      'application@fund.application': {
        template: fundApplicationBlocks,
        controller: 'FundApplicationBlocksController',
        controllerAs: 'vm'
      }
    },
    params: {
      workflowID: null,
      stateID: null,
      currentAppPage: 'application'
    }
  })
  .state('fund.application.contact', {
    url: '/contact',
    views: {
      'application@fund.application': {
        template: '<md-card><md-card-content><strong>Ansøger</strong> Assentofthallen<br/><strong>Kontaktperson</strong> Navn Navnsen</strong><br/><strong>E-mail</strong> navn@navnsen.dk<br/><strong>Telefon</strong> 21 22 23 24</md-card-content></md-card>'
      }
    },
    params: {
      currentAppPage: 'contact'
    }
  })
  .state('fund.application.history', {
    url: '/history',
    views: {
      'application@fund.application': {
        template: fundApplicationHistory,
        controller: 'FundApplicationHistoryController',
        controllerAs: 'vm'
      }
    },
    params: {
      currentAppPage: 'history'
    }
  })
  .state('fund.budget', {
    url: '/budget',
    views: {
      'fundMain@fund': {
        template: fundApplicationBudget,
        controller: 'FundApplicationBudgetController',
        controllerAs: 'vm'
      }
    },
    params: {
      currentAppPage: 'budget'
    }
  })
  .state('fund.demodata', {
    url: '/demodata',
    views: {
      'fundMain@fund': {
        controller: function (fundService) {
          var vm = this
          fundService.resetDemoData()
          .then(function (response) {
            vm.result = response
          })
        },
        controllerAs: 'vm',
        template: '<div>{{ vm.result }}</div>'
      }
    }
  })
  .state('fund.demodatadanva', {
    url: '/demodatadanva',
    views: {
      'fundMain@fund': {
        controller: function (fundService) {
          var vm = this
          fundService.resetDemoDataDanva()
          .then(function (response) {
            vm.result = response
          })
        },
        controllerAs: 'vm',
        template: '<div>{{ vm.result }}</div>'
      }
    }
  })
}
