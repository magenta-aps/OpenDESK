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
  .controller('FundApplicationController', ['$scope', '$stateParams', '$state', 'fundService', FundApplicationController])

function FundApplicationController ($scope, $stateParams, $state, fundService) {
  var vm = this
  $scope.application = null
  $scope.currentAppPage = $stateParams.currentAppPage || 'application'
  vm.paginateApps = paginateApps
  vm.prevAppId = null
  vm.nextAppId = null

  activate()

  function activate() {
    fundService.getApplication($stateParams.applicationID)
    .then(function (response) {
      $scope.application = response
      // if we have a state in store, but the currently loaded application
      // doesn't have state information, clear both state and workflow values
      // from the store
      if($scope.$parent.state && !$scope.application.state) {
        $scope.$parent.state = null
        $scope.$parent.workflow = null
      }
      // conversely, if we don't have a state in store, but the currently
      // loaded application does have state information, load it to the store
      else if(!$scope.$parent.state && $scope.application.state) {
        fundService.getWorkflowState($scope.application.state.nodeID)
        .then(function (response) {
          $scope.$parent.state = response
        })
      }
      // load variables for next/previous buttons, if they exist
      if ($scope.$parent.state) {
        var currAppIdx = $scope.$parent.state.applications.findIndex(app => app.nodeID == $scope.application.nodeID)
        var prevAppIdx = currAppIdx - 1 < 0 ? null : currAppIdx - 1 // we can't paginate to negative indices
        var nextAppIdx = currAppIdx + 1 >= $scope.$parent.state.applications.length ? null : currAppIdx + 1 // neither can we paginate to pages out of length
        vm.prevAppId = prevAppIdx !== null ? $scope.$parent.state.applications[prevAppIdx].nodeID : null
        vm.nextAppId = nextAppIdx !== null ? $scope.$parent.state.applications[nextAppIdx].nodeID : null
      }
    })
  }
  function paginateApps(appId) {
    $state.go('fund.application', { applicationID: appId })
  }
}
