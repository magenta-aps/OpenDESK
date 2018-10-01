'use strict'

angular
  .module('openDeskApp.systemsettings')
  .controller('SettingsGroupsController', ['groupService', SettingsGroupsController])

function SettingsGroupsController (groupService) {
  var vm = this

  vm.openMemberInfo = groupService.openMemberInfo
  vm.editMembers = groupService.editMembers

  activate()

  function activate () {
    groupService.getOpenDeskGroups()
      .then(function (groups) {
        vm.groups = groups
      })
  }
}
