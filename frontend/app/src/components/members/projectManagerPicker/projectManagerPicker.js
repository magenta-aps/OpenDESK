'use strict'
import projectManagerPickerTemplate from './projectManagerPicker.html'

angular.module('openDeskApp.members')
  .component('projectManagerPicker', {
    template: projectManagerPickerTemplate,
    controller: ['siteService', 'MemberService', projectManagerPicker],
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function projectManagerPicker (siteService, MemberService) {
  var vm = this

  vm.searchManagers = searchManagers

  function searchManagers (query) {
    if (query)
      return MemberService.search(query)
  }
}
