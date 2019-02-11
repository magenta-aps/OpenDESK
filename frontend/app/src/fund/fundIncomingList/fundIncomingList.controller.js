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
  .controller('FundIncomingListController', ['fundService', FundIncomingListController])

function FundIncomingListController (fundService) {
  var vm = this
  var _applications = []
  vm.applications = []

  fundService.getNewApplications()
  .then(function (response) {
    vm.applications = response
  })
}
