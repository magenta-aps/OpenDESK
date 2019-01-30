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
  vm.applications = getApplications

  activate()

  function activate() {
    new Promise(function (resolve, reject) {
      if($scope.$parent.workflow && $scope.$parent.workflow.nodeID === $stateParams.workflowID) { // if we already have a workflow object in the scope, and its ID is identical to the one we're trying to load, just reuse it
        resolve($scope.$parent.workflow)
      }
      else { // otherwise, get a new workflow object from the service
        resolve(fundService.getWorkflow($stateParams.workflowID))
      }
    })
    .then(function (response) {
      $scope.$parent.workflow = response // update the workflow scope variable. if we already had something, we are essentially setting the variable to the same value
      return fundService.getWorkflowState($stateParams.stateID || response.states[0].nodeID) // either get the state we've navigated to, or just get the first state in the selected workflow
    })
    .then(function (response) {
      $scope.$parent.state = response
      $state.go('fund.workflow', { workflowID: $scope.$parent.workflow.nodeID, stateID: response.nodeID })
    })
  }

  function getApplications() {
    return $scope.$parent.state ? $scope.$parent.state.applications || [] : []
  }
}
