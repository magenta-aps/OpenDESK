// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../../shared/directives/iconPicker'

angular
  .module('openDeskApp')
  .controller('ConfigController', ['APP_BACKEND_CONFIG', 'editorService', 'systemSettingsService', ConfigController])

function ConfigController (APP_BACKEND_CONFIG, editorService, systemSettingsService) {
  var vm = this

  vm.config = angular.copy(APP_BACKEND_CONFIG)
  vm.updateSettings = updateSettings

  vm.addNewDashboardLink = addNewDashboardLink
  vm.removeDashboardLink = removeDashboardLink

  activate()

  function activate () {
    vm.editors = editorService.getEditors()
  }

  function updateSettings () {
    systemSettingsService.updateSettings(vm.config)
  }

  function addNewDashboardLink () {
    vm.config.dashboardLink.push({
      icon: '',
      label: '',
      url: '',
      newWindow: false
    })
  }

  function removeDashboardLink (index) {
    vm.config.dashboardLink.splice(index, 1)
  }
}
