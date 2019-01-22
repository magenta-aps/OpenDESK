// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular.module('od.review')
  .factory('reviewService', ['$http', reviewService])

function reviewService ($http) {
  var service = {
    approve: approve,
    create: create,
    get: get,
    reject: reject,
    reply: reply,
    update: update
  }

  return service

  function get (nodeId) {
    return $http.get('/alfresco/service/review/' + nodeId)
      .then(function (response) {
        return response.data
      })
  }

  function create (nodeId, userName, message) {
    var payload = {
      assignee: userName,
      message: message,
      nodeId: nodeId
    }
    return $http.post('/alfresco/service/review', payload)
      .then(function (response) {
        return response
      })
  }

  function approve (nodeId, reply) {
    var payload = {
      status: 'approved'
    }
    if (reply)
      payload.reply = reply

    return $http.put('/alfresco/service/review/' + nodeId, payload)
      .then(function (response) {
        return response
      })
  }

  function reject (nodeId, reply) {
    var payload = {
      status: 'rejected'
    }
    if (reply)
      payload.reply = reply

    return $http.put('/alfresco/service/review/' + nodeId, payload)
      .then(function (response) {
        return response
      })
  }

  function reply (nodeId, reply) {
    var payload = {
      reply: reply
    }
    return $http.put('/alfresco/service/review/' + nodeId, payload)
      .then(function (response) {
        return response
      })
  }

  function update (nodeId, assignee) {
    var payload = {
      assignee: assignee
    }
    return $http.put('/alfresco/service/review/' + nodeId, payload)
      .then(function (response) {
        return response
      })
  }
}
