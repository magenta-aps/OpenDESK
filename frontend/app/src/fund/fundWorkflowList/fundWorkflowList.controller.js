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
  .controller('FundWorkflowListController', ['$state', 'fundService', 'browserService', 'headerService', FundWorkflowListController])

function FundWorkflowListController ($state, fundService, browserService, headerService) {
  var vm = this
  vm.workflows = []

  activate()

  function activate() {
    var title = 'Fondsansøgninger'
    browserService.setTitle(title)
    headerService.setTitle(title)
    fundService.getActiveWorkflows()
    .then(function (response) {
      vm.workflows = response
    })
  }
}
