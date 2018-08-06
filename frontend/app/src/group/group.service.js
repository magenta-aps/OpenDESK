'use strict'
import infoMemberTemplate from './groupMember/infoMember.tmpl.html'
import editMembersTemplate from './view/editMembers.tmpl.html'

angular.module('openDeskApp.group')
  .factory('groupService', ['$http', '$mdDialog', '$translate', 'sessionService', groupService])

function groupService ($http, $mdDialog, $translate, sessionService) {
  var openDeskGroups = []
  var groupShortNames = [
    {
      shortName: 'OPENDESK_ProjectOwners',
      type: 'USER'
    },
    {
      shortName: 'OPENDESK_OrganizationalCenters',
      type: 'GROUP'
    }
  ]

  groupShortNames.forEach(function (group) {
    getMembers(group.shortName).then(function (response) {
      var groupItem = {
        shortName: group.shortName,
        displayName: $translate.instant('GROUPS.' + group.shortName),
        type: group.type,
        members: response
      }
      openDeskGroups.push(groupItem)
    })
  })

  var service = {
    getGroups: getGroups,
    getMembers: getMembers,
    getProjectOwners: getProjectOwners,
    getOpenDeskGroups: getOpenDeskGroups,
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

  function getMembers (groupName) {
    return $http.post('/alfresco/service/groups', {
      PARAM_METHOD: 'getGroupMembers',
      PARAM_GROUP_NAME: groupName
    }).then(function (response) {
      var group = response.data
      group.forEach(function (member) {
        member.avatar = sessionService.makeAvatarUrl(member)
      })
      return group
    })
  }

  function getProjectOwners () {
    var groups = openDeskGroups.filter(function (o) {
      return o.shortName === 'OPENDESK_ProjectOwners'
    })
    return groups[0].members
  }

  function getOpenDeskGroups () {
    return openDeskGroups
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
