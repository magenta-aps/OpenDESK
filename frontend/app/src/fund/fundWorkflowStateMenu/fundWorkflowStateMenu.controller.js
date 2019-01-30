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
  .controller('FundWorkflowStateMenuController', ['$stateParams', '$scope', 'fundService', FundWorkflowStateMenuController])

function FundWorkflowStateMenuController ($stateParams, $scope, fundService) {
  activate()

  function activate() {
    if (!$scope.$parent.workflow && $stateParams.workflowID) {
      fundService.getWorkflow($stateParams.workflowID)
      .then(function (response) {
        $scope.$parent.workflow = response
      })
    }
  }
}
