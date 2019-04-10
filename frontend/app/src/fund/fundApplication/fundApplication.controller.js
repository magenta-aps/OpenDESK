//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.fund')
  .controller('FundApplicationController', ['$scope', '$stateParams', '$state', 'fundService', 'browserService', 'headerService', 'alfrescoNodeService', 'fundApplicationEditing', FundApplicationController])

function FundApplicationController ($scope, $stateParams, $state, fundService, browserService, headerService, alfrescoNodeService, fundApplicationEditing) {
  var vm = this

  $scope.application = null
  $scope.currentAppPage = $stateParams.currentAppPage || 'application'
  $scope.isEditing = fundApplicationEditing
  $scope.allFields = allFields
  vm.prevAppId = null
  vm.nextAppId = null
  vm.origValue = null

  vm.editApplication = editApplication
  vm.saveApplication = saveApplication
  vm.cancelEditApplication = cancelEditApplication
  vm.paginateApps = paginateApps

  activate()

  function activate() {
    fundApplicationEditing.set(false) // set editing state to false, in case we edited an application, went to the list, and opened another application
    fundService.getApplication($stateParams.applicationID)
    .then(function (response) {
      $scope.application = response
      $scope.$broadcast('applicationWasLoaded', null)
      browserService.setTitle(response.title)
      headerService.setTitle(response.title)
      // if we have a workflow in store, but it doesn't match the workflow of the
      // application we just loaded, get new values for the store so we can
      // populate the left-hand nav. The same applies if we have no workflow in store
      if(!$scope.$parent.workflow || $scope.$parent.workflow && $scope.$parent.workflow.nodeID !== $scope.application.workflow.nodeID) { // need to also check that a workflow exists in the parent, otherwise we'll get an error of undefined
        fundService.getWorkflow($scope.application.workflow.nodeID)
        .then(function (response) {
          $scope.$parent.workflow = response
        })
      }
      // similarly, if we have a state in store, but it doesn't match the state of the
      // application we just loaded, get new values for the store. The same applies if we have
      // no state in store
      if(!$scope.$parent.state || $scope.$parent.state && $scope.$parent.state.nodeID !== $scope.application.state.nodeID) { // need to also check that a state exists in the parent, otherwise we'll get an error of undefined
        fundService.getWorkflowState($scope.application.state.nodeID)
        .then(function (response) {
          $scope.$parent.state = response
        })
      }
      // generate pagination links
      generatePaginationLinks()
    })
  }

  function allFields () {
    return $scope.application ? [].concat.apply([], $scope.application.blocks.map(block => block.fields)) : [] // flatten all fields into one array, https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
  }

  function paginateApps(appId) {
    $state.go('fund.application', { applicationID: appId })
  }

  function editApplication() {
    vm.origValue = JSON.parse(JSON.stringify($scope.application)) // make a copy instead of passing a reference
    fundApplicationEditing.set(true)
  }

  function saveApplication () {
    fundApplicationEditing.set(false)

    // for each file field we have in the application, upload the
    // new file, if a new file has been added.
    // Only when all these uploads have succeeded can we update the application

    Promise.all(
      $scope.allFields()
      .filter(function (field) {
        if (field.component !== 'file') {
          return false
        }
        return document.getElementById(field.value).files.length > 0
      })
      .map(function (field) {
        // the field only allows the user to select one file, so we can just
        // take item 0
        var file = document.getElementById(field.value).files[0]
        return fundService.uploadContent(file, $scope.application.nodeRef, field.id)
        .then(function (response) {
          field.value = alfrescoNodeService.processNodeRef(response.data.nodeRef).id
        })
      })
    )
    .then(function () {
      fundService.updateApplication($scope.application.nodeID, $scope.application)
      .then(function (response) {
        if (response.status === 'OK') {
          activate()
        }
      })
    })
  }

  function cancelEditApplication () {
    $scope.application = JSON.parse(JSON.stringify(vm.origValue))
    fundApplicationEditing.set(false)
  }

  function generatePaginationLinks () {
    // load variables for next/previous buttons, if they exist
    if ($scope.$parent.state) {
      var currAppIdx = $scope.$parent.state.applications.findIndex(app => app.nodeID == $scope.application.nodeID)
      var prevAppIdx = currAppIdx - 1 < 0 ? null : currAppIdx - 1 // we can't paginate to negative indices
      var nextAppIdx = currAppIdx + 1 >= $scope.$parent.state.applications.length ? null : currAppIdx + 1 // neither can we paginate to pages out of length
      vm.prevAppId = prevAppIdx !== null ? $scope.$parent.state.applications[prevAppIdx].nodeID : null
      vm.nextAppId = nextAppIdx !== null ? $scope.$parent.state.applications[nextAppIdx].nodeID : null
    }
  }

  // asynchronously generate prev/next links, as they may not be ready when we first load the page
  // (fundService needs to finish the requests)
  $scope.$on('workflowstatechange', function (event, args) {
    generatePaginationLinks()
  })
}
