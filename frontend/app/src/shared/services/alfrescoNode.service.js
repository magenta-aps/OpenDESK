// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .factory('alfrescoNodeService', ['$http', alfrescoNodeService])

function alfrescoNodeService ($http) {
  var service = {
    processNodeRef: processNodeRef,
    updateName: updateName,
    updateTitle: updateTitle
  }
  return service

  function processNodeRef (nodeRefInput) {
    try {
      // Split the nodeRef and rebuild from composite parts, for clarity and to support input of uri node refs.
      var arr = nodeRefInput.replace(':/', '').split('/'),
        storeType = arr[0],
        storeId = arr[1],
        id = arr[2],
        uri = storeType + '/' + storeId + '/' + id,
        nodeRef = storeType + '://' + storeId + '/' + id

      return (
        {
          nodeRef: nodeRef,
          storeType: storeType,
          storeId: storeId,
          id: id,
          uri: uri,
          toString: function () {
            return nodeRef
          }
        })
    } catch (e) {
      e.message = 'Invalid nodeRef: ' + nodeRef
      throw e
    }
  }

  function updateName (nodeRef, name) {
    var payLoad = {
      name: name
    }
    return $http.put('/alfresco/s/node/' + processNodeRef(nodeRef).id + '/rename', payLoad)
      .then(function (response) {
        return response.data
      })
  }

  function updateTitle (nodeRef, title) {
    var props = {
      prop_cm_title: title
    }
    return $http.post('/api/node/' + processNodeRef(nodeRef).uri + '/formprocessor', props)
      .then(function (response) {
        return response.data
      })
  }
}
