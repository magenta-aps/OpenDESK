// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp')
  .controller('IconPickerController', ['ICON_CONFIG', '$scope', IconPickerController])

function IconPickerController (ICON_CONFIG, $scope) {
  var vm = this

  vm.selectIcon = selectIcon
  vm.icons = ICON_CONFIG.data

  $scope.selectedIcon = $scope.selectedIcon !== '' ? $scope.selectedIcon : vm.icons[0].name

  function selectIcon (id) {
    $scope.selectedIcon = vm.icons[id].name
  }
}
