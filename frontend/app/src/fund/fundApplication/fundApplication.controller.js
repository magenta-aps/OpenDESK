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
  .controller('FundApplicationController', ['$scope', '$stateParams', 'fundService', '$mdDialog', FundApplicationController])

function FundApplicationController ($scope, $stateParams, fundService, $mdDialog) {
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
        console.log('hej')
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
        self.selectedBranch = null
        self.selectedYear = null
        self.selectedState = null
        self.selectedFlow = vm.application.nodeID
        self.activeWorkflows = []
        self.branches = []
        self.years = []
        console.log(vm.application.nodeID)


        //TODO: Maybe separate Application, Dialog, and Toast to lower coupling
        self.showToast = function() {
            $mdToast.showSimple("hej")
        }

        // Fetch data for selectors:
        fundService.getActiveWorkflows()
            .then(function (response) {
                self.activeWorkflows = response
            })
        fundService.getBranches()
            .then(function (response) {
                self.branches = response
            })
        // TODO: Get time range from data
        self.getYears = function() {
            var currentYear = (new Date()).getFullYear(), years = []
            for (var i=currentYear-10; i<currentYear + 11; i++) {
                self.years.push(i)
            }
            return years
        }
        self.getYears()

        // Methods for button actions:
        // $scope.hide = function() {
        //     $mdDialog.hide();
        // };

        self.cancel = function() {
            $mdDialog.cancel();
        };

        self.apply = function(answer) {
            $mdDialog.hide(answer)
                .then(self.showToast())
        };
    }
}
