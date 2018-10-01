'use strict'
import projectOwnerPickerTemplate from './projectOwnerPicker.html'
import '../../../shared/services/filter.service'

angular.module('openDeskApp.members')
  .component('projectOwnerPicker', {
    template: projectOwnerPickerTemplate,
    controller: ['filterService', 'groupService', projectOwnerPicker],
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function projectOwnerPicker (filterService, groupService) {
  var vm = this
  var owners = []

  vm.searchOwners = searchOwners

  activate()

  function activate () {
    groupService.getProjectOwners()
      .then(function (response) {
        owners = response
      })
  }

  function searchOwners (query) {
    return filterService.search(owners, {
      displayName: query
    })
  }
}
