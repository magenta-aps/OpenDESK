'use strict'

angular
  .module('openDeskApp.group')
  .controller('GroupMemberController', ['$mdDialog', 'member', GroupMemberController])

function GroupMemberController ($mdDialog, member) {
  var vm = this
  vm.member = member

  vm.cancelDialog = cancelDialog

  function cancelDialog () {
    $mdDialog.cancel()
  }
}
