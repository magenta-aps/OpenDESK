// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .factory('personService', ['$http', personService])

function personService ($http) {
  var blankImageUrl = 'assets/img/avatars/blank-profile-picture.png'
  return {
    addExternalPerson: addExternalPerson,
    getAvatarUrlFromRef: getAvatarUrlFromRef,
    getPerson: getPerson,
    searchAuthorities: searchAuthorities,
    searchPerson: searchPerson,
    validatePerson: validatePerson
  }

  function addExternalPerson (siteShortName, userName, firstName, lastName, email, telephone, groupName) {
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

  function getAvatarUrlFromRef (avatarRef) {
    if (avatarRef !== undefined) {
      var avatarId = avatarRef.split('/')[3]
      return `/alfresco/s/api/node/workspace/SpacesStore/${avatarId}/content`
    }
    return blankImageUrl
  }

  function getPerson (username) {
    return $http.get('/alfresco/s/person/' + username)
      .then(function (response) {
        return response.data
      })
  }

  function searchAuthorities (filter) {
    return $http.get(`/alfresco/service/authority/search?filter=${filter}`)
      .then(function (response) {
        return response.data
      })
  }

  function searchPerson (filter) {
    return $http.get(`/alfresco/s/person/search?filter=${filter}`)
      .then(function (response) {
        return response.data
      })
  }

  function validatePerson (userName, email) {
    var payload = {
      userName: userName,
      email: email
    }
    return $http.post('/alfresco/s/person/validate', payload)
      .then(function (response) {
        return response.data
      })
  }
}
