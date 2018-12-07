// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import infoMemberTemplate from './groupMember/infoMember.tmpl.html'
import editMembersTemplate from './view/editMembers.tmpl.html'

angular.module('openDeskApp.group')
  .factory('groupService', ['$http', '$mdDialog', groupService])

function groupService ($http, $mdDialog) {
  var service = {
    getGroups: getGroups,
    getOpenDeskGroups: getOpenDeskGroups,
    getOrganizationalCenters: getOrganizationalCenters,
    getProjectOwners: getProjectOwners,
    openMemberInfo: openMemberInfo,
    editMembers: editMembers,
    addMember: addMember,
    removeMember: removeMember
  }

  return service

  function getGroups (filter) {
    return $http.get('/alfresco/s/api/groups?zone=APP.DEFAULT&shortNameFilter=?-' + filter
    ).then(function (response) {
      return response.data.data
    })
  }

  function getOpenDeskGroups () {
    return $http.get('/alfresco/service/authority/openDeskGroups')
      .then(function (response) {
        return response.data
      })
  }

  function getOrganizationalCenters () {
    return $http.get(`/alfresco/service/authority/organizational-centers`)
      .then(function (response) {
        return response.data.members
      })
  }

  function getProjectOwners () {
    return $http.get(`/alfresco/service/authority/project-owners`)
      .then(function (response) {
        return response.data.members
      })
  }

  function openMemberInfo (member) {
    $mdDialog.show({
      template: infoMemberTemplate,
      controller: 'GroupMemberController',
      controllerAs: 'vm',
      locals: {
        member: member
      },
      clickOutsideToClose: true
    })
  }

  function editMembers (group) {
    $mdDialog.show({
      controller: 'GroupController as vm',
      template: editMembersTemplate,
      locals: {
        group: group
      },
      clickOutsideToClose: true
    })
  }

  function addMember (shortName, groupName) {
    return $http.post('/alfresco/s/api/groups/' + groupName + '/children/' + shortName, {})
  }

  function removeMember (shortName, groupName) {
    return $http.delete('/alfresco/s/api/groups/' + groupName + '/children/' + shortName, {})
  }
}
