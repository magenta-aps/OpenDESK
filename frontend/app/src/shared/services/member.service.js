'use strict';

angular.module('openDeskApp')
    .factory('member', memberService);

function memberService($http) {

  var service = {
    add: addMember,
    addExternal: addExternalMember,
    validate: validateMember,
    get: getMember,
    remove: removeMember,
    search: searchMember
  };
  
  return service;

  function getMember (username) {
    return $http.get('/api/people/' + username).then(function (response) {
      return response.data;
  });
  }

  function addMember (siteShortName, username, group) {
    var payload = {
      PARAM_METHOD: "addUser",
      PARAM_SITE_SHORT_NAME: siteShortName,
      PARAM_USER: username,
      PARAM_GROUP: group
    }

    return $http.post("/alfresco/service/sites", payload)
    .then(function (response) {
      return response.data;
    });
  }

  function removeMember (siteShortName, username, group) {
    var payload = {
      PARAM_METHOD: "removeUser",
      PARAM_SITE_SHORT_NAME: siteShortName,
      PARAM_USER: username,
      PARAM_GROUP: group
    }

    return $http.post("/alfresco/service/sites", payload)
    .then(function (response) {
        return response.data;
    });
  }

  function addExternalMember (siteShortName, userName, firstName, lastName, email, telephone, groupName) {
    return $http.post('/alfresco/service/users', {
        PARAM_METHOD: "createExternalUser",
        PARAM_SITE_SHORT_NAME: siteShortName,
        PARAM_USERNAME: userName,
        PARAM_FIRSTNAME: firstName,
        PARAM_LASTNAME: lastName,
        PARAM_EMAIL: email,
        PARAM_TELEPHONE: telephone,
        PARAM_GROUP_NAME: groupName
    }).then(function (response) {
        return response.data[0];
    });
  }

  function validateMember (userName, email) {
    var payload = {
      PARAM_METHOD: "validateNewUser",
      PARAM_USERNAME: userName,
      PARAM_EMAIL: email
    }

    return $http.post('/alfresco/service/users', payload)
    .then(function (response) {
        return response.data[0];
    });
  }

  function searchMember (query) {
    return $http.post("/alfresco/service/users", {
      PARAM_METHOD : "getUsers",
      PARAM_FILTER: query
    }).then(function(response) {
      return response.data;
    });
  }
}