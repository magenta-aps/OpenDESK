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
  .controller('FundDemoController', ['fundService', FundDemoController])

function FundDemoController (fundService) {
  var vm = this

  fundService.resetDemoData()
  .then(function (response) {
    vm.result = response
  })
}

angular
  .module('openDeskApp.fund')
  .controller('FundDemoDanvaController', ['fundService', FundDemoDanvaController])

function FundDemoDanvaController (fundService) {
  var vm = this

  fundService.resetDemoDataDanva()
  .then(function (response) {
    vm.result = response
  })
}
