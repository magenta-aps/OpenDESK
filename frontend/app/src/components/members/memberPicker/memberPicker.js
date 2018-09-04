'use strict'
import memberPickerTemplate from './memberPicker.html'

angular.module('openDeskApp.members')
  .component('memberPicker', {
    template: memberPickerTemplate,
    controller: ['memberService', memberPicker],
    bindings: {
      selected: '='
    }
  })

function memberPicker (memberService) {
  var vm = this

  vm.searchPerson = searchPerson

  function searchPerson (query) {
    if (query)
      return memberService.searchPerson(query)
  }
}
