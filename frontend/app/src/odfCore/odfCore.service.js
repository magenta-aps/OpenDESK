'use strict'

angular.module('openDeskApp.odf')
  .factory('odfCoreService', ['$http', OdfCoreService]);
  
  function OdfCoreService ($http) {

  var service = {
    getBranches: getBranches,
    getBranch: getBranch,
    addBranch: addBranch,
    getWorkflows: getWorkflows,
    getActiveWorkflows : getActiveWorkflows,
    getWorkflow: getWorkflow,
    getWorkflowState : getWorkflowState,
    getApplication : getApplication,
    getNewApplications : getNewApplications,
    resetDemoData : resetDemoData
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
  
  function getWorkflows() {
    return $http.get(`/alfresco/service/foundation/workflow`)
      .then(function (response) {
        return response.data
      })
  }
  
  function getActiveWorkflows() {
    return $http.get(`/alfresco/service/foundation/activeworkflow`)
      .then(function (response) {
        return response.data
      })
  }
  
  function getWorkflow(workflowID) {
    return $http.get(`/alfresco/service/foundation/workflow/${workflowID}`)
      .then(function (response) {
        return response.data
      })
  }
  
  function getWorkflowState(stateID) {
      return $http.get(`/alfresco/service/foundation/state/${stateID}`)
      .then(function (response) {
        return response.data
      })
  }
  
  function getApplication(applicationID) {
      return $http.get(`/alfresco/service/foundation/application/${applicationID}`)
      .then(function (response) {
        return response.data
      })
  }
  
  function getNewApplications() {
      return $http.get(`/alfresco/service/foundation/incomming`)
      .then(function (response) {
        return response.data
      })
  }
  
  function resetDemoData() {
      return $http.post(`/alfresco/service/foundation/demodata`)
      .then(function (response) {
          console.log(response)
        return response.data
      })
  }
  }