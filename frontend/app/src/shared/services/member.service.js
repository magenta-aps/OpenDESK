'use strict'

angular.module('openDeskApp')
  .factory('MemberService', ['$http', 'personService', MemberService])

function MemberService ($http, personService) {
  var service = {
    add: addMember,
    addExternal: addExternalMember,
    validate: validateMember,
    get: getMember,
    remove: removeMember,
    findAuthorities: findAuthorities,
    search: searchPerson
  }

  return service

  function getMember (username) {
    return $http.get('/api/people/' + username).then(function (response) {
      var user = response.data
      user.displayName = user.firstName
      if (user.lastName !== '')
        user.displayName += ' ' + user.lastName
      user.avatar = personService.getAvatarUrl(user)
      return user
    })
  }

  function addMember (siteShortName, authority, group) {
    return $http.post(`/alfresco/service/site/${siteShortName}/group/${group}/member/${authority}`)
      .then(function (response) {
        return response.data
      })
  }

  function removeMember (siteShortName, authority, group) {
    return $http.delete(`/alfresco/service/site/${siteShortName}/group/${group}/member/${authority}`)
      .then(function (response) {
        return response.data
      })
  }

  function addExternalMember (siteShortName, userName, firstName, lastName, email, telephone, groupName) {
    var payLoad = {
      firstName: firstName,
      lastName: lastName,
      userName: userName,
      email: email,
      telephone: telephone,
      siteShortName: siteShortName,
      groupName: groupName
    }
    return $http.post('/alfresco/service/person/external', payLoad)
      .then(function (response) {
        return response.data
      })
  }

  function validateMember (userName, email) {
    var payload = {
      userName: userName,
      email: email
    }
    return $http.post('/alfresco/service/person/validate', payload)
      .then(function (response) {
        return response.data
      })
  }

  function findAuthorities (filter) {
    return $http.get(`/alfresco/service/authority/search?filter=${filter}`)
      .then(function (response) {
        return response.data
      })
  }

  function searchPerson (filter) {
    return $http.get(`/alfresco/service/person/search?filter=${filter}`)
      .then(function (response) {
        return response.data
      })
  }
}
