// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.group')
  .controller('GroupController', ['$mdDialog', '$mdToast', '$translate', 'group', 'groupService', 'personService',
    GroupController])

function GroupController ($mdDialog, $mdToast, $translate, group, groupService, personService) {
  var vm = this
  vm.group = group

  vm.cancelDialog = cancelDialog
  vm.updateMembers = updateMembers
  vm.search = search
  vm.addMember = addMember
  vm.removeMember = removeMember
  vm.getMemberShortName = getMemberShortName

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function updateMembers () {
    cancelDialog()
    $translate('MEMBER.MEMBERS_UPDATED')
      .then(function (msg) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(msg)
            .hideDelay(3000)
        )
      })
  }

  function search (query) {
    if (query)
      switch (vm.group.type) {
        case 'USER':
          return personService.searchPerson(query)
        case 'GROUP':
          return groupService.getGroups(query)
      }
  }

  function addMember (member, groupName) {
    var shortName = getMemberShortName(member)
    groupService.addMember(shortName, groupName)
  }

  function removeMember (member, groupName) {
    var shortName = getMemberShortName(member)
    groupService.removeMember(shortName, groupName)
  }

  function getMemberShortName (member) {
    if (member.userName)
      return member.userName
    else if (member.fullName)
      return member.fullName
    else return ''
  }
}
