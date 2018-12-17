'use strict'

angular.module('openDeskApp.odf')
  .factory('odfCoreService', ['$http', OdfCoreService]);
  
  function OdfCoreService ($http) {

  var service = {
    getBranches: getBranches,
    getBranch: getBranch,
    addBranch: addBranch
  }

  return service

  function getBranches() {
    return $http.get(`/alfresco/service/foundation/branch`)
      .then(function (response) {
        return response.data
      })
  }
  
   function getBranch(nodeID) {
    return $http.get(`/alfresco/service/foundation/branch/${nodeID}`)
      .then(function (response) {
        return response.data
      })
  }
  
  function addBranch(branchTitle) {
      var payload = {title: branchTitle}
      return $http.post(`/alfresco/service/foundation/branch`, payload)
      .then(function(response){
          return response
      })
  }
  }