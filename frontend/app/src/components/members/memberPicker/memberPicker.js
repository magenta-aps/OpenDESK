'use strict'
import memberPickerTemplate from './memberPicker.html'

angular.module('openDeskApp.members')
  .component('memberPicker', {
    template: memberPickerTemplate,
    controller: ['personService', memberPicker],
    bindings: {
      selected: '='
    }
  })

function memberPicker (personService) {
  var vm = this

  vm.searchPerson = searchPerson

  function searchPerson (query) {
    if (query)
      return personService.searchPerson(query)
  }
}
