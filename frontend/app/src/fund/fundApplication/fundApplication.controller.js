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
  .controller('FundApplicationController', ['$scope', '$stateParams', '$state', 'fundService', 'browserService', 'headerService', 'fundApplicationEditing', '$mdDialog', FundApplicationController])

function FundApplicationController ($scope, $stateParams, $state, fundService, browserService, headerService, fundApplicationEditing, $mdDialog) {
  var vm = this

  $scope.application = null
  $scope.currentAppPage = $stateParams.currentAppPage || 'application'
  $scope.isEditing = fundApplicationEditing
  vm.prevAppId = null
  vm.nextAppId = null
  vm.origValue = null
    vm.branches = []

  vm.editApplication = editApplication
  vm.saveApplication = saveApplication
  vm.cancelEditApplication = cancelEditApplication
  vm.paginateApps = paginateApps

    activate()

    function activate() {
    fundService.getApplication($stateParams.applicationID)
    .then(function (response) {
      $scope.application = response
      browserService.setTitle(response.title)
      headerService.setTitle(response.title)
      // if we have a workflow in store, but it doesn't match the workflow of the
      // application we just loaded, get new values for the store so we can
      // populate the left-hand nav. The same applies if we have no workflow in store
      if(!$scope.$parent.workflow || $scope.$parent.workflow && $scope.$parent.workflow.nodeID !== $scope.application.workflow.nodeID) { // need to also check that a workflow exists in the parent, otherwise we'll get an error of undefined
        fundService.getWorkflow($scope.application.workflow.nodeID)
        .then(function (response) {
          $scope.$parent.workflow = response
        })
      }
      // similarly, if we have a state in store, but it doesn't match the state of the
      // application we just loaded, get new values for the store. The same applies if we have
      // no state in store
      if(!$scope.$parent.state || $scope.$parent.state && $scope.$parent.state.nodeID !== $scope.application.state.nodeID) { // need to also check that a state exists in the parent, otherwise we'll get an error of undefined
        fundService.getWorkflowState($scope.application.state.nodeID)
        .then(function (response) {
          $scope.$parent.state = response
        })
      }
      // generate pagination links
      generatePaginationLinks()
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
            locals: {
                application: $scope.application
            },
            clickOutsideToClose:true,
        })
    };


    function DialogController($mdDialog, $mdToast, application) {
        var self = this
        self.selectedBranch = application.branchSummary
        self.selectedBudget = application.budget
        self.selectedState = application.state
        self.selectedFlow = application.workflow
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

    function ToastCtrl($mdToast, $mdDialog, $document, $scope) {
        var ctrl = this;
        ctrl.closeToast = function() {
            $mdToast.hide();
        };
        ctrl.goToApplicaion = function() {
            $state.go('fund.application', {applicationID: $scope.application.nodeID}) //workflowID and stateID are left out in the request.
        }
    }

  function paginateApps(appId) {
    $state.go('fund.application', { applicationID: appId })
  }

  function editApplication() {
    vm.origValue = JSON.parse(JSON.stringify($scope.application)) // make a copy instead of passing a reference
    fundApplicationEditing.set(true)
  }

  function saveApplication () {
    fundApplicationEditing.set(false)

    fundService.updateApplication($scope.application.nodeID, $scope.application)
    .then(function (response) {
      if (response.status === 'OK') {
        activate()
      }
    })
  }

  function cancelEditApplication () {
    $scope.application = JSON.parse(JSON.stringify(vm.origValue))
    fundApplicationEditing.set(false)
  }

  function generatePaginationLinks () {
    // load variables for next/previous buttons, if they exist
    if ($scope.$parent.state) {
      var currAppIdx = $scope.$parent.state.applications.findIndex(app => app.nodeID == $scope.application.nodeID)
      var prevAppIdx = currAppIdx - 1 < 0 ? null : currAppIdx - 1 // we can't paginate to negative indices
      var nextAppIdx = currAppIdx + 1 >= $scope.$parent.state.applications.length ? null : currAppIdx + 1 // neither can we paginate to pages out of length
      vm.prevAppId = prevAppIdx !== null ? $scope.$parent.state.applications[prevAppIdx].nodeID : null
      vm.nextAppId = nextAppIdx !== null ? $scope.$parent.state.applications[nextAppIdx].nodeID : null
    }
  }

  // asynchronously generate prev/next links, as they may not be ready when we first load the page
  // (fundService needs to finish the requests)
  $scope.$on('workflowstatechange', function (event, args) {
    generatePaginationLinks()
  })
}
