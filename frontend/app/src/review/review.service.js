'use strict'

angular.module('od.review')
  .factory('review', ['$http', review])

function review ($http) {
  var service = {
    approve: approve,
    create: create,
    get: get,
    reject: reject,
    reply: reply,
    update: update
  }

  return service

  function get (nodeRef) {
    console.log('get review')
  }

  function create (params) {
    console.log('create review')
  }

  function approve () {
    console.log('approve review')
  }

  function reject () {
    console.log('reject review')
  }

  function reply (params) {
    console.log('reply review')
  }

  function update (params) {
    return $http.delete('/alfresco/api/')
      .then(function (response) {
        return response
      })
  }
}
