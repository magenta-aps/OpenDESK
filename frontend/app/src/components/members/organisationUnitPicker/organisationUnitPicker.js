'use strict'
import organisationUnitPickerTemplate from './organisationUnitPicker.html'

angular.module('openDeskApp.members')
  .component('organisationUnitPicker', {
    template: organisationUnitPickerTemplate,
    controller: organisationUnitPicker,
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function organisationUnitPicker (siteService) {
  var vm = this
  vm.organisationUnits = []

  activate()

  function activate () {
    siteService.getAllOrganizationalCenters()
      .then(function (response) {
        vm.organisationUnits = response.data
      }, function (err) {
        console.log(err)
      }
      )
  }
}
