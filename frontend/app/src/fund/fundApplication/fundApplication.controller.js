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

    fundService.getBranches()
      .then(function (response) {
          vm.branches = response
      })
  }
    vm.status = '  ';
    vm.customFullscreen = false;

    vm.showAlert = function(ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('This is an alert title')
                .textContent('You can specify some description text in here.')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
                .targetEvent(ev)
        );
    };

    vm.moveApp = function() {
        $mdDialog.show({
            controller: function () {
                var vm = this
                vm.branches = []
                fundService.getBranches()
                    .then(function (response) {
                        vm.branches = response
                    })
            },
            controllerAs: 'vm',
            template:
            '<md-dialog>' +
            ' <md-dialog-content>' +
            ' <span class="md-headline">Flyt ansøgninger</span>' +
            ' <div layout="column" layout-align="center center" style="width:100%;">' +
            ' <md-select placeholder="Flow" ng-model="vm.selectedBranch" ng-model-options="{trackBy: $value.nodeID}">' +
            '   <md-option ng-repeat="branch in vm.branches" >\n' +
            '{{branch.title}}\n' +
            '</md-option>' +
            '</md-select>' +
            ' <md-button class="md-primary md-raised" style="width: 90%;">Flow</md-button>' +
            ' <md-button class="md-primary md-raised" style="width: 90%;">BANKOMRÅDE</md-button>' +
            ' <md-button class="md-primary md-raised" style="width: 90%;">BUDGETÅR</md-button>' +
            ' </div>' +
            ' </md-dialog-content>' +
            // ' <md-dialog-actions></md-dialog-actions>' +
            ' </md-dialog>',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
        })
    };


    function DialogController($scope, $mdDialog) {
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
