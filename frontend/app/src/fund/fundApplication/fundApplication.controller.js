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
  .controller('FundApplicationController', ['$scope', '$stateParams', 'fundService', '$mdDialog', '$state', FundApplicationController])

function FundApplicationController ($scope, $stateParams, fundService, $mdDialog, $state) {
    var vm = this
    vm.application = null
    vm.branches = []

    $scope.currentAppPage = $stateParams.currentAppPage || 'application';

    activate()

    function activate() {
    fundService.getApplication($stateParams.applicationID)
    .then(function (response) {
      vm.application = response
      // if we have a state in store, but the currently loaded application
      // doesn't have state information, clear both state and workflow values
      // from the store
      if($scope.$parent.state && !vm.application.state) {
        $scope.$parent.state = null
        $scope.$parent.workflow = null
      }
      // conversely, if we don't have a state in store, but the currently
      // loaded application does have state information, load it to the store
      else if(!$scope.$parent.state && vm.application.state) {
        fundService.getWorkflowState(vm.application.state.nodeID)
        .then(function (response) {
          $scope.$parent.state = response
        })
      }
    })

    }

    vm.status = '  ';
    vm.customFullscreen = false;

    vm.moveApp = function() {
        $mdDialog.show({
            controller: DialogController,
            controllerAs: 'self',
            template: require('./components/moveApp.html'),
            parent: angular.element(document.body),
            clickOutsideToClose:true,
        })
    };


    function DialogController($scope, $mdDialog, $mdToast) {
        var self = this
        //TODO: Why does selectors not initialise with application values?
        self.selectedBranch = vm.application.branchSummary
        self.selectedBudget = vm.application.budget
        self.selectedState = vm.application.state
        self.selectedFlow = vm.application.workflow
        self.activeWorkflows = []
        self.branches = []
        self.states = []
        self.budgetYears = []


        //TODO: Maybe separate Application, Dialog, and Toast to lower coupling
        self.showToast = function() {
            $mdToast.show({
                hideDelay: 9000,
                position: 'bottom right',
                controller: ToastCtrl,
                controllerAs: 'ctrl',
                bindToController: true,
                template: require('./components/toastTemplate.html')
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
                .then(console.log(vm.application))
                .then($state.go('fund.workflow', { workflowID: vm.application.workflow.nodeID, stateID: vm.application.state.nodeID })) //Send user back to application list
                .then(fundService.updateApplication(vm.application.nodeID, self.changedAttributes())) //and update the application according to selections
                .then(console.log("Application after"))
                .then(console.log(vm.application))
                .then(self.showToast())
        };
    }

    function ToastCtrl($mdToast, $mdDialog, $document, $scope) {
        var ctrl = this;
        ctrl.closeToast = function() {
            $mdToast.hide();
        };
        ctrl.goToApplicaion = function() {
            $state.go('fund.application', {applicationID: vm.application.nodeID}) //workflowID and stateID are left out in the request.
        }
    }
}
