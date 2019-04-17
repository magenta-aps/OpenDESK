//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import toastTemplate from './view/toastTemplate.html'

angular
    .module('openDeskApp.fund')
    .controller('DialogController', ['$scope', '$state', '$mdDialog', 'fundService', '$mdToast', 'application', DialogController])

function DialogController($scope, $state, $mdDialog, fundService, $mdToast, application) {
    var self = this
    self.selectedBranch = application.branchSummary
    self.selectedBudget = application.budget
    self.selectedState = application.state
    self.selectedFlow = application.workflow
    self.activeWorkflows = []
    self.branches = []
    self.states = []
    self.budgetYears = []

    self.showToast = function() {
        $mdToast.show({
            hideDelay: 9000,
            position: 'bottom right',
            controller: 'ToastController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: toastTemplate,
            locals: {
                application: $scope.application
            }
        })
    }

    // Fetch data for selectors:
    fundService.getActiveWorkflows()
        .then(function (response) {
            self.activeWorkflows = response
        })

    fundService.getBudgetYears()
        .then(function (response) {
            self.budgetYears = response
        })

    // Update branch and state drop-down according to selected workflow.
    // Is called whenever workflow is changed
    self.workflowChange = function(){
        fundService.getWorkflow(self.selectedFlow.nodeID)
            .then(function(response) {
                fundService.getWorkflow(response.nodeID)
                    .then(function(response) {
                        self.states = response.states
                        self.branches = response.usedByBranches
                    })
            })
    }
    self.workflowChange() //Set branch and state drop-down initially

    self.changedAttributes = function() {
        var result = {}
        // 'workFlow' is automatically changed according to 'branchSummary'
        if (self.selectedBranch != null) {
            console.log("pow");
            result.branchSummary = {"nodeID": self.selectedBranch.nodeID}
        }
        if (self.selectedState != null) {
            result.state = {"nodeID": self.selectedState.nodeID}
        }
        if (self.selectedBudget != null) {
            result.budget = {"nodeID": self.selectedBudget.nodeID}
        }
        console.log(result)
        return result
    }

    self.cancel = function() {
        $mdDialog.cancel();
    };

    self.apply = function(answer) {
        $mdDialog.hide(answer)
            .then(console.log("Application before"))
            .then(console.log($scope.application))
            .then($state.go('fund.workflow', { workflowID: $scope.application.workflow.nodeID, stateID: $scope.application.state.nodeID })) //Send user back to application list
            .then(fundService.updateApplication($scope.application.nodeID, self.changedAttributes())) //and update the application according to selections
            .then(console.log("Application after"))
            .then(console.log($scope.application))
            .then(self.showToast())
    };
}
