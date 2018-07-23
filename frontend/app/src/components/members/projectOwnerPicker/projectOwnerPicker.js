'use strict'
import projectOwnerPickerTemplate from './projectOwnerPicker.html'
import '../../../shared/services/filter.service'

angular.module('openDeskApp.members')
  .component('projectOwnerPicker', {
    template: projectOwnerPickerTemplate,
    controller: ['siteService', 'filterService', projectOwnerPicker],
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function projectOwnerPicker (siteService, filterService) {
  var vm = this
  var owners = []

  vm.searchOwners = searchOwners

  activate()

  function activate () {
    siteService.getAllOwners()
      .then(function (response) {
        owners = response
      }, function (err) {
        console.log(err)
      }
      )
  }

  function searchOwners (query) {
    return filterService.search(owners, {
      displayName: query
    })
  }
}
