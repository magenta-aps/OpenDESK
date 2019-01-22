// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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
