'use strict'
import projectManagerPickerTemplate from './projectManagerPicker.html'

angular.module('openDeskApp.members')
  .component('projectManagerPicker', {
    template: projectManagerPickerTemplate,
    controller: ['personService', projectManagerPicker],
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function projectManagerPicker (personService) {
  var vm = this

  vm.searchManagers = searchManagers

  function searchManagers (query) {
    if (query)
      return personService.searchPerson(query)
  }
}
