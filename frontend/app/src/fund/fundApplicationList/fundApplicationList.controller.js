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
  .controller('FundApplicationListController', ['fundService', '$scope', '$state', '$stateParams', FundApplicationListController])

function FundApplicationListController (fundService, $scope, $state, $stateParams) {

  var vm = this
  vm.order = 'name'
  vm.reverse = false
  vm.applications = getApplications()
  vm.branches = []
  vm.filterList = filterList
  vm.years = (function() {
    const nowYear = (new Date()).getFullYear()
    // first generate an array of n elements, counting from current year and adding 1
    // for each element (index i; we don't care about current value, available in variable _
    let range = Array.from(Array(17), (_, i) => nowYear + i)
    // then map to minus/plus n/2 years, so that we can get previous years too
    return range.map(y => y - Math.round(range.length / 2))
  })()
  vm.selectedYear = (new Date()).getFullYear()

  activate()

  function activate() {
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
      $state.go('fund.workflow', { workflowID: $scope.$parent.workflow.nodeID, stateID: response.nodeID })
    })

    fundService.getBranches()
    .then(function (response) {
      vm.branches = response
    })
  }

  function getApplications() {
    // get applications from the selected state, or default to an empty list if no state is set in $scope, or if said state in $scope does not have an applications property
    return $scope.$parent.state ? $scope.$parent.state.applications || [] : []
  }

  function filterList(branchID, year) {
    fundService.getApplicationsByBranch(branchID)
    .then(function (response) {
      vm.applications = response
    })
  }
}
