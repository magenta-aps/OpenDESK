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
  .controller('FundController', ['APP_FUND_CONFIG', FundController])

function FundController (APP_FUND_CONFIG) {
  var vm = this
  vm.links = APP_FUND_CONFIG.fundLink
  // @TODO: Maybe get the links here, instead of inside the module. I.e. call a service that returns the links, like in siteDetail.controller.activate()
  vm.lightenDarkenColor = function () {
    return APP_FUND_CONFIG.fundBaseColor
  }
}
