'use strict'

angular.module('openDeskApp')
  .factory('MemberService', ['$http', MemberService])

function MemberService ($http) {
  var service = {
    add: addMember,
    addExternal: addExternalMember,
    validate: validateMember,
    get: getMember,
    remove: removeMember,
    findAuthorities: findAuthorities,
    search: findUsers
  }

  return service

  function getMember (username) {
    return $http.get('/api/people/' + username).then(function (response) {
      return response.data
    })
  }

  function addMember (siteShortName, authority, group) {
    var payload = {
      authority: authority,
      group: group
    }
    return $http.post(`/alfresco/service/site/${siteShortName}/member`, payload)
      .then(function (response) {
        return response.data
      })
  }

  function removeMember (siteShortName, authority, group) {
    var payload = {
      authority: authority,
      group: group
    }

    return $http.delete(`/alfresco/service/site/${siteShortName}/member`, payload)
      .then(function (response) {
        return response.data
      })
  }

  function addExternalMember (siteShortName, userName, firstName, lastName, email, telephone, groupName) {
    return $http.post('/alfresco/service/users', {
      PARAM_METHOD: 'createExternalUser',
      PARAM_SITE_SHORT_NAME: siteShortName,
      PARAM_USERNAME: userName,
      PARAM_FIRSTNAME: firstName,
      PARAM_LASTNAME: lastName,
      PARAM_EMAIL: email,
      PARAM_TELEPHONE: telephone,
      PARAM_GROUP_NAME: groupName
    }).then(function (response) {
      return response.data[0]
    })
  }

  function validateMember (userName, email) {
    var payload = {
      PARAM_METHOD: 'validateNewUser',
      PARAM_USERNAME: userName,
      PARAM_EMAIL: email
    }

    return $http.post('/alfresco/service/users', payload)
      .then(function (response) {
        return response.data[0]
      })
  }

  function findAuthorities (query) {
    return $http.post('/alfresco/service/users', {
      PARAM_METHOD: 'findAuthorities',
      PARAM_FILTER: query
    }).then(function (response) {
      return response.data
    })
  }

  function findUsers (query) {
    return $http.post('/alfresco/service/users', {
      PARAM_METHOD: 'findUsers',
      PARAM_FILTER: query
    }).then(function (response) {
      return response.data
    })
  }
}
