//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.fund')
  .controller('FundApplicationListController', ['fundService', '$scope', '$state', '$stateParams', 'browserService', 'headerService', FundApplicationListController])

function FundApplicationListController (fundService, $scope, $state, $stateParams, browserService, headerService) {

  var vm = this
  vm.order = 'name'
  vm.reverse = false
  $scope.$parent.applications = getApplications()
  vm.branches = []
  vm.years = []
  vm.filterList = filterList

  // logic for controlling selection of applications with checkboxes
  vm.toggleSelectedApp = toggleSelectedApp
  vm.toggleAppSelection = toggleAppSelection
  vm.batchMoveApplications = batchMoveApplications

  activate()

  function activate() {
    vm.selectedApps = []
    new Promise(function (resolve, reject) {
      // if we already have a workflow object in the $scope, and its ID is identical to the one we're trying to load, just reuse it
      if($scope.$parent.workflow && $scope.$parent.workflow.nodeID === $stateParams.workflowID) {
        resolve($scope.$parent.workflow)
      }
      // otherwise, get a new workflow object from the service, based on the $state variable
      else {
        resolve(fundService.getWorkflow($stateParams.workflowID))
      }
    })
    .then(function (response) {
      // update the workflow $scope variable. if we already had something, we are essentially setting the variable to the same value
      $scope.$parent.workflow = response
      // either get the state we've navigated to, or just get the first state in the selected workflow
      return fundService.getWorkflowState($stateParams.stateID || response.states[0].nodeID)
    })
    .then(function (response) {
      $scope.$parent.state = response
      $scope.$parent.applications = response.applications
      $state.go('fund.workflow', { workflowID: $scope.$parent.workflow.nodeID, stateID: response.nodeID })

      var title = $scope.$parent.workflow.title + ' - ' + response.title
      browserService.setTitle(title)
      headerService.setTitle(title)
    })

    fundService.getBranches()
    .then(function (response) {
      vm.branches = response
    })

    fundService.getBudgetYears()
    .then(function (response) {
      vm.years = response
    })
  }

  function getApplications() {
    // get applications from the selected state, or default to an empty list if no state is set in $scope, or if said state in $scope does not have an applications property
    return $scope.$parent.state ? $scope.$parent.state.applications || [] : []
  }

  function toggleSelectedApp (appId) {
    if (vm.selectedApps.includes(appId)) { // if array contains the value, that means we're deselecting the item
      vm.selectedApps = vm.selectedApps.filter(id => id !== appId)
    }
    else {
      vm.selectedApps.push(appId)
    }
  }

  function toggleAppSelection () {
    $scope.$parent.applications.forEach(app =>  {
      toggleSelectedApp(app.nodeID)
    })
  }

  function filterList() {
    console.log('branch', vm.selectedBranch, 'year', vm.selectedYear)
    if (vm.selectedBranch || vm.selectedYear) {
      fundService.getApplicationsByBranchAndBudget(vm.selectedBranch, vm.selectedYear)
      .then(function (response) {
        $scope.$parent.applications = response
      })
    }
    else {
      // if parameters are reset, that means we should get the full list of applications.
      // That's precisely what we do in activate()
      activate()
    }
  }

  function batchMoveApplications() {
    var apps = []
    if(vm.moveToBranch) {
      Promise.all(vm.selectedApps.map(app => {
        return fundService.setApplicationState(app, vm.moveToBranch)
      }))
      .then(function () {
        activate()
      })
    }
  }
}
