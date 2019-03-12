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
  .controller('FundController', ['$scope', 'browserService', 'headerService', FundController])

function FundController ($scope, browserService, headerService) {
  $scope.workflow = null
  $scope.state = null
  $scope.applications = null

  activate()

  function activate() {
    var title = 'Fondsansøgninger'
    browserService.setTitle(title)
    headerService.setTitle(title)
  }

  // watch for changes to state, as we need those in FundApplicationController
  // in order to generate pagination links
  $scope.$watch('state', function(newVal, oldVal, scope) {
    if (newVal != oldVal) {
      $scope.$broadcast('workflowstatechange', newVal)
    }
  }, true)
}