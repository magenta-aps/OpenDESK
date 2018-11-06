'use strict'
import organisationUnitPickerTemplate from './organisationUnitPicker.html'

angular.module('openDeskApp.members')
  .component('organisationUnitPicker', {
    template: organisationUnitPickerTemplate,
    controller: ['groupService', organisationUnitPicker],
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function organisationUnitPicker (groupService) {
  var vm = this
  vm.organizationalCenters = []

  activate()

  function activate () {
    groupService.getOrganizationalCenters()
      .then(function (response) {
        vm.organizationalCenters = response
      })
  }
}
