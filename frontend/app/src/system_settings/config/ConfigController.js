'use strict'
import '../../shared/directives/iconPicker'

angular
  .module('openDeskApp')
  .controller('ConfigController', ['APP_BACKEND_CONFIG', 'systemSettingsService', ConfigController])

function ConfigController (APP_BACKEND_CONFIG, systemSettingsService) {
  var vm = this

  vm.config = angular.copy(APP_BACKEND_CONFIG)
  vm.updateSettings = updateSettings

  vm.addNewDashboardLink = addNewDashboardLink
  vm.removeDashboardLink = removeDashboardLink

  activate()

  function activate () {
    systemSettingsService.getEditors().then(function (response) {
      vm.editors = response
    })
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
