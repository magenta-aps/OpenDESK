'use strict'
import memberPickerTemplate from './memberPicker.html'

angular.module('openDeskApp.members')
  .component('memberPicker', {
    template: memberPickerTemplate,
    controller: ['siteService', 'userService', memberPicker],
    bindings: {
      selected: '='
    }
  })

function memberPicker (siteService, userService) {
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
      return userService.getUsers(query)
  }
}
