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
        return response.data[0]
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
