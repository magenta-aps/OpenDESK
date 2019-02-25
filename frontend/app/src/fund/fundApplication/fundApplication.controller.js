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
  vm.selectedBranch = null
  vm.selectedFlow = null
  vm.selectedYear = null

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
            controllerAs: 'vm',
            template: require('./components/moveApp.html'),
            parent: angular.element(document.body),
            clickOutsideToClose:true,
        })
    };


    function DialogController($scope, $mdDialog) {
        var vm = this
        vm.activeWorkflows = []
        vm.branches = []
        vm.years = []

        // Fetch data for selectors:
        fundService.getActiveWorkflows()
            .then(function (response) {
                vm.activeWorkflows = response
            })
        fundService.getBranches()
            .then(function (response) {
                vm.branches = response
            })
        // TODO: Get time range from data
        vm.getYears = function() {
            var currentYear = (new Date()).getFullYear(), years = []
            for (var i=currentYear-10; i<currentYear + 11; i++) {
                vm.years.push(i)
            }
            return years
        }
        vm.getYears()

        // Methods for button actions:
        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }
}
