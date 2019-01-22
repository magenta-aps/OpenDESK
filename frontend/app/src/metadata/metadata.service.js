// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/services/alfrescoDocument.service'

angular
  .module('openDeskApp.metadata')
  .factory('metadataService', ['$http', metadataService])

function metadataService ($http) {
  return {
    getPropertyDefinitions: getPropertyDefinitions,
    getPropertyUIDefinitions: getPropertyUIDefinitions,
    updateProperties: updateProperties
  }

  function getPropertyDefinitions (nodeId) {
    return $http
      .get(`/alfresco/s/node/${nodeId}/propertyDefinitions`)
      .then(function (response) {
        return response.data
      })
  }

  function getPropertyUIDefinitions (nodeId) {
    return $http
      .get(`/alfresco/s/node/${nodeId}/propertyUIDefinitions`)
      .then(function (response) {
        return response.data
      })
  }

  function updateProperties (nodeId, properties) {
    var params = {
      properties: properties
    }
    $http.put(`/alfresco/s/node/${nodeId}/properties`, params)
  }
}
