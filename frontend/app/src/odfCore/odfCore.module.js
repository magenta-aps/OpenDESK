'use strict'
import 'angular-fixed-table-header'
import branchListTemplate from './BranchList/BranchList.html'
import branchDetailTemplate from './BranchDetail/BranchDetail.html'
import workflowOverviewTemplate from './WorkflowOverview/WorkflowOverview.html'
import applicationDetailTemplate from './ApplicationDetail/ApplicationDetail.html'
import newApplicationsTemplate from './NewApplicationsOverview/NewApplicationsOverview.html'

angular.module('openDeskApp.odf', ['fixed.table.header'])
  .config(['$stateProvider', 'APP_CONFIG', 'USER_ROLES', config]);

function config ($stateProvider, APP_CONFIG, USER_ROLES) {
  $stateProvider.state('odf', {
    parent: 'site',
    url: '/ansoegninger',
    views: {
      'content@': {
        template: branchListTemplate,
        controller: 'BranchListController',
        controllerAs: 'vm'
        
      }
    },
    params: {
      authorizedRoles: [USER_ROLES.user]
    }
  })
  .state('odf.detail', {
      url: '/:nodeID',
      views: {
        'content@': {
          template: branchDetailTemplate,
          controller: 'BranchDetailController',
          controllerAs: 'vm'
        }
      }
    })
    .state('odf.workflowOverview', {
      url: '/workflow/:workflowID',
      params: {
            stateID: null
        },
      views: {
        'content@': {
          template: workflowOverviewTemplate,
          controller: 'WorkflowOverviewController',
          controllerAs: 'vm'
        }
      }
    })
    .state('odf.applicationDetail', {
      url: '/application/:applicationID',
          params: {
            workflowID: null,
            stateID: null
        },
      views: {
        'content@': {
          template: applicationDetailTemplate,
          controller: 'ApplicationDetailController',
          controllerAs: 'vm'
        }
      }
    })
    .state('odf.newApplications', {
      url: '/incomming',
      views: {
        'content@': {
          template: newApplicationsTemplate,
          controller: 'NewApplicationsOverviewController',
          controllerAs: 'vm'
        }
      }
    })
    
}
