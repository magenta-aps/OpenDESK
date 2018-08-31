'use strict'
import memberPickerTemplate from './memberPicker.html'

angular.module('openDeskApp.members')
  .component('memberPicker', {
    template: memberPickerTemplate,
    controller: ['MemberService', memberPicker],
    bindings: {
      selected: '='
    }
  })

function memberPicker (MemberService) {
  var vm = this

  vm.searchPerson = searchPerson

  function searchPerson (query) {
    if (query)
      return MemberService.search(query)
  }
}
