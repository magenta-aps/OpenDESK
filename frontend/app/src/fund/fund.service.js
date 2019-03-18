//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular.module('openDeskApp.fund')
  .factory('fundService', ['$http', 'alfrescoNodeService', FundService]);

  function FundService ($http, alfrescoNodeService) {

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
      getApplicationsByBranch: getApplicationsByBranch,
      getApplicationsByBranchAndBudget: getApplicationsByBranchAndBudget,
      updateApplication: updateApplication,
      setApplicationState : setApplicationState,
      setApplicationBranch: setApplicationBranch,
      setApplicationBudget: setApplicationBudget,
      getCurrentBudgetYear: getCurrentBudgetYear,
      getBudgetYears: getBudgetYears,
      getBudgetYear: getBudgetYear,
      getBudgets: getBudgets,
      createBudget: createBudget,
      createBudgetYear: createBudgetYear,
      getBudget: getBudget,

      resetDemoData : resetDemoData
    }

    return service

    //Retrieves a summary of all branches
    function getBranches() {
      return $http.get(`/alfresco/service/foundation/branch`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves the full information about the specified branch.
    function getBranch(nodeID) {
      return $http.get(`/alfresco/service/foundation/branch/${nodeID}`)
      .then(function (response) {
        return response.data
      })
    }

    //Creates a new branch with the specified title
    function addBranch(branchTitle) {
      var payload = {"title": branchTitle}
      return $http.post(`/alfresco/service/foundation/branch`, payload)
      .then(function(response){
        return response
      })
    }

    //Retrieves a summary of all workflows.
    function getWorkflows() {
      return $http.get(`/alfresco/service/foundation/workflow`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves a summary of active workflows. Active workflows are the workflows which are currently used by a branch.
    function getActiveWorkflows() {
      return $http.get(`/alfresco/service/foundation/activeworkflow`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves the full information of the target workflow
    function getWorkflow(workflowID) {
      return $http.get(`/alfresco/service/foundation/workflow/${workflowID}`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves the full information of the target state
    function getWorkflowState(stateID) {
      return $http.get(`/alfresco/service/foundation/state/${stateID}`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves the full information of the target application
    function getApplication(applicationID) {
      return $http.get(`/alfresco/service/foundation/application/${applicationID}`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves all new applications. New applications are the applications which has not yet been assigned to a branch.
    function getNewApplications() {
      return $http.get(`/alfresco/service/foundation/incomming`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves all applications in the specified branch
    function getApplicationsByBranch(branchID) {
      return $http.get(`/alfresco/service/foundation/branch/${branchID}/applications`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves all applications in the specified branch, and with the specified budget
    function getApplicationsByBranchAndBudget(branchID, budgetID) {
      var queryParams = []
      if (branchID) {
        queryParams.push('branchID=' + branchID)
      }
      if (budgetID) {
        queryParams.push('budgetID=' + budgetID)
      }
      queryParams = queryParams.join('&')
      return $http.get('/alfresco/service/foundation/application?' + queryParams)
      .then(function (response) {
        return response.data
      })
    }

    //Updates fields in the application depending on the fields defined in the payload
    function updateApplication(applicationID, payload) {
      return $http.post(`/alfresco/service/foundation/application/${applicationID}`, payload)
      .then(function (response) {
        return response.data
      })
    }

    //Sets the state of the specified application
    function setApplicationState(applicationID, stateID) {
      var payload = {"state": {"nodeID": stateID}}
      return $http.post(`/alfresco/service/foundation/application/${applicationID}`, payload)
      .then(function (response) {
        return response.data
      })
    }

    //Sets the branch of the specified application. This will also change the applications workflow, if the workflow on the new
    //branch is different than the workflow on the current branch.
    function setApplicationBranch(applicationID, branchID) {
      var payload = {"branchSummary": {"nodeID": branchID}}
      return $http.post(`/alfresco/service/foundation/application/${applicationID}`, payload)
      .then(function (response) {
        return response.data
      })
    }

    //Sets the budget of the specified application
    function setApplicationBudget(applicationID, budgetID) {
      var payload = {"budget": {"nodeID": budgetID}}
      return $http.post(`/alfresco/service/foundation/application/${applicationID}`, payload)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves the current BudgetYear if one exists.
    //If a BudgetYear has a start/end date which incompasses the current date, that BudgetYear will be returned
    function getCurrentBudgetYear() {
      return $http.get(`/alfresco/service/foundation/budgetYear/current`)
      .then(function (response) {
        return response.data
      })
    }

    //Get all BudgetYears defined in the system.
    //All BudgetYears are returned by this method. Both expired and future BudgetYears are returned
    function getBudgetYears() {
      return $http.get(`/alfresco/service/foundation/budgetYear`)
      .then(function (response) {
        return response.data
      })
    }

    //Gets a specific BudgetYear by its ID
    function getBudgetYear(budgetYearID) {
      return $http.get(`/alfresco/service/foundation/budgetYear/${budgetYearID}`)
      .then(function (response) {
        return response.data
      })
    }

    //Get all budgets in the specified BudgetYear
    function getBudgets(budgetYearID) {
      return $http.get(`/alfresco/service/foundation/budgetYear/${budgetYearID}/budget`)
      .then(function (response) {
        return response.data
      })
    }

    //Retrieves the budget with the specified ID
    function getBudget(budgetID) {
      return $http.get(`/alfresco/service/foundation/budget/${budgetID}`)
      .then(function (response) {
        return response.data
      })
    }

    //Creates a new BudgetYear, with the title and total amount specified.
    //Dates must be in ISO 8601 UTC format, for example: 2019-02-28T09:16:27Z
    function createBudgetYear(title, startDate, endDate) {
      var payload = {"title": title, "startDate": startDate, "endDate": endDate}
      return $http.post(`/alfresco/service/foundation/budgetYear`, payload)
      .then(function (response) {
        return response.data
      })
    }

    //Creates a new budget within the specified BudgetYear, with the title and total amount specified.
    function createBudget(budgetYearID, title, amountTotal) {
      var payload = {"title": title, "amountTotal": amountTotal}
      return $http.post(`/alfresco/service/foundation/budgetYear/${budgetYearID}/budget`, payload)
      .then(function (response) {
        return response.data
      })
    }

    //Resets demo-data
    function resetDemoData() {
      return $http.post(`/alfresco/service/foundation/demodata`)
      .then(function (response) {
          console.log(response)
        return response.data
      })
    }

    //Upload content to an application
    function uploadContent (file, application) {
      var folderId = null
      var appId = alfrescoNodeService.processNodeRef(application).id

      return $http.get(`/alfresco/service/foundation/application/${appId}/documentfolder`)
      .then(function (response) {
        folderId = response

        return $http.get(`/alfresco/service/node/${response}/next-available-name/${file.name}`)
      })
      .then(function (response) {
        var formData = new FormData()
        formData.append('filedata', file)
        formData.append('filename', response.data.fileName)
        formData.append('destination', folderId)

        var headers = {
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }

        return $http.post('/api/upload', formData, headers)
      })
      .then(function (response) {
        return response
      })
    }
  }
