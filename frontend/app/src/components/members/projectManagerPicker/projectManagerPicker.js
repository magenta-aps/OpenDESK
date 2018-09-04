'use strict'
import projectManagerPickerTemplate from './projectManagerPicker.html'

angular.module('openDeskApp.members')
  .component('projectManagerPicker', {
    template: projectManagerPickerTemplate,
    controller: ['siteService', 'memberService', projectManagerPicker],
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function projectManagerPicker (siteService, memberService) {
  var vm = this

  vm.searchManagers = searchManagers

  function searchManagers (query) {
    if (query)
      return memberService.search(query)
  }
}
