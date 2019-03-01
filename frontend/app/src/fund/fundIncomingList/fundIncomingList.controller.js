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
  .controller('FundIncomingListController', ['fundService', '$scope', 'browserService', 'headerService', FundIncomingListController])

function FundIncomingListController (fundService, $scope, browserService, headerService) {

  activate()

  function activate () {
    var title = 'Indkomne ansøgninger'
    browserService.setTitle(title)
    headerService.setTitle(title)
    $scope.$parent.workflow = null
    $scope.$parent.state = {
      title: title
    }
    fundService.getNewApplications()
    .then(function (response) {
      $scope.$parent.applications = response
    })
  }
}
