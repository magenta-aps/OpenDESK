'use strict'
import infoMemberTemplate from './groupMember/infoMember.tmpl.html'
import editMembersTemplate from './view/editMembers.tmpl.html'

angular.module('openDeskApp.group')
  .factory('groupService', ['$http', '$mdDialog', 'sessionService', groupService])

function groupService ($http, $mdDialog, sessionService) {
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
    var openDeskGroups = []
    return $http.get('/alfresco/service/authority/openDeskGroups')
      .then(function (response) {
        var groups = response.data
        groups.forEach(function (group) {
          prepareGroup(group)
          openDeskGroups.push(group)
        })
        return openDeskGroups
      })
  }

  function getOrganizationalCenters () {
    return $http.get(`/alfresco/service/authority/organizational-centers`)
      .then(function (response) {
        var group = response.data
        prepareGroup(group)
        return group.members
      })
  }

  function getProjectOwners () {
    return $http.get(`/alfresco/service/authority/project-owners`)
      .then(function (response) {
        var group = response.data
        prepareGroup(group)
        return group.members
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

  function prepareGroup (group) {
    group.members.forEach(function (member) {
      member.avatar = sessionService.makeAvatarUrl(member)
    })
  }

  function removeMember (shortName, groupName) {
    return $http.delete('/alfresco/s/api/groups/' + groupName + '/children/' + shortName, {})
  }
}
