'use strict'
import 'angular-fixed-table-header'
import branchListTemplate from './BranchList/BranchList.html'
import branchDetailTemplate from './BranchDetail/BranchDetail.html'

angular.module('openDeskApp.odf', ['fixed.table.header'])
  .config(['$stateProvider', 'APP_CONFIG', 'USER_ROLES', config]);

function config ($stateProvider, APP_CONFIG, USER_ROLES) {
  $stateProvider.state('branchList', {
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
  .state('branchList.detail', {
      url: '/:nodeID',
      views: {
        'content@': {
          template: branchDetailTemplate,
          controller: 'BranchDetailController',
          controllerAs: 'vm'
        }
      }
    })
    
}
