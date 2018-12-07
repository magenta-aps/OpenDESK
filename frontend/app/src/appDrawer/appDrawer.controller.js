// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.appDrawer')
  .controller('AppDrawerController', ['$mdSidenav', 'APP_BACKEND_CONFIG', AppDrawerController])

function AppDrawerController ($mdSidenav, APP_BACKEND_CONFIG) {
  var vm = this

  vm.close = close
  vm.links = APP_BACKEND_CONFIG.dashboardLink

  function close () {
    $mdSidenav('appDrawer').close()
  }
}
