'use strict'
import memberPickerTemplate from './memberPicker.html'

angular.module('openDeskApp.members')
  .component('memberPicker', {
    template: memberPickerTemplate,
    controller: ['siteService', 'MemberService', memberPicker],
    bindings: {
      selected: '='
    }
  })

function memberPicker (siteService, MemberService) {
  var vm = this
  var owners = []

  vm.searchManagers = searchManagers

  activate()

  function activate () {
    siteService.getAllOwners()
      .then(function (response) {
        owners = response
      },
      function (err) {
        console.log(err)
      }
      )
  }

  function searchManagers (query) {
    if (query)
      return MemberService.search(query)
  }
}
