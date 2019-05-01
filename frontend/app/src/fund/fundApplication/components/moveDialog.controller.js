//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import toastTemplate from './toast.view.html'

angular
  .module('openDeskApp.fund')
  .controller('MoveDialogController', ['$state', '$scope', '$mdDialog', '$mdToast', 'fundService', 'application', MoveDialogController])

function MoveDialogController ($state, $scope, $mdDialog, $mdToast, fundService, application) {
  var self = this
  self.selectedBranch = null
  self.selectedBudget = application.budget
  self.selectedState = null
  self.selectedFlow = application.workflow
  self.activeWorkflows = []
  self.branches = []
  self.states = []
  self.budgetYears = []

  self.showToast = showToast
  self.workflowChange = workflowChange
  self.changedAttributes = changedAttributes
  self.cancel = cancel
  self.apply = apply

  activate()

  function activate () {
    // Fetch data for selectors:
    fundService.getActiveWorkflows()
    .then(function (response) {
      self.activeWorkflows = response
      self.workflowChange() //Set branch and state drop-down initially
    })

    fundService.getBudgetYears()
    .then(function (response) {
      self.budgetYears = response
    })
  }

  function showToast () {
    $mdToast.show({
      hideDelay: 9000,
      position: 'bottom right',
      controller: 'ToastController',
      controllerAs: 'ctrl',
      bindToController: true,
      template: toastTemplate
    })
  }

  // Update branch and state drop-down according to selected workflow.
  // Is called whenever workflow dropdown is changed
  function workflowChange () {
    // If the application already belongs to the workflow we've selected,
    // we are only allowed to move it to the state(s) listed as allowed
    // transitions for the current workflow state.
    if (application.workflow && application.workflow.nodeID == self.selectedFlow.nodeID) {
      if (application.state) {
        // irritatingly, although we already have a workflow, we need
        // to get it again in order to get the branches of it
        fundService.getWorkflow(application.workflow.nodeID)
        .then(function (response) {
          self.branches = response.usedByBranches
          self.selectedBranch = application.branchSummary || self.branches[0]
        })
        fundService.getWorkflowState(application.state.nodeID)
        .then(function (response) {
          self.states = response.references
        })
      }
    }
    else {
      fundService.getWorkflow(self.selectedFlow ? self.selectedFlow.nodeID : self.activeWorkflows[0].nodeID)
      .then(function(response) {
        if (!self.selectedFlow || self.selectedFlow && self.selectedFlow.title != response.title) {
          self.selectedFlow = response // update the actual binding
        }
        self.states = response.states
        self.branches = response.usedByBranches
        self.selectedBranch = application.branchSummary || self.branches[0]
      })
    }
  }

  function changedAttributes () {
    var result = {}
    if (self.selectedFlow != null) {
      result.workflow = {"nodeID": self.selectedFlow.nodeID}
    }
    if (self.selectedBranch != null) {
      result.branchSummary = {"nodeID": self.selectedBranch.nodeID}
    }
    if (self.selectedState != null) {
      result.state = {"nodeID": self.selectedState.nodeID}
    }
    if (self.selectedBudget != null) {
      result.budget = {"nodeID": self.selectedBudget.nodeID}
    }
    return result
  }

  function cancel () {
    $mdDialog.cancel()
  }

  function apply (answer) {
    $mdDialog.hide(answer)
    .then(function () {
      return fundService.updateApplication(application.nodeID, self.changedAttributes())
    })
    .then(function () {
      if (self.selectedFlow) {
        $state.go('fund.workflow', { workflowID: self.selectedFlow.nodeID, stateID: self.selectedState ? self.selectedState.nodeID : null }) //Send user back to application list
        self.showToast()
      }
    })
    .catch(function () {
      $mdToast.show(
        $mdToast.simple()
        .textContent('Der skete en fejl. Ansøgningen blev ikke flyttet.')
        .position('bottom right')
        .hideDelay(5000)
      )
    })
  }
}
