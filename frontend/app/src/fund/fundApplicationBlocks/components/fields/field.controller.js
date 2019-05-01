//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular.module('openDeskApp.fund')
  .controller('ApplicationFieldController', ['$scope', 'fundApplicationEditing', 'contentService', 'alfrescoDownloadService', 'alfrescoNodeService', ApplicationFieldController])

function ApplicationFieldController ($scope, fundApplicationEditing, contentService, alfrescoDownloadService, alfrescoNodeService) {
  var vm = this
  var parentScope = $scope.$parent.$parent.$parent.$parent.$parent // TODO: this creates a tight coupling

  $scope.isEditing = fundApplicationEditing
  $scope.fieldHasValue = fieldHasValue
  $scope.fieldIsRequired = null
  $scope.pattern = null

  vm.downloadFile = downloadFile
  vm.nodeID = nodeID
  vm.file = null

  activate()

  function activate() {
    // if the field is a file field, we need to get the corresponding file
    // from the backend
    if ($scope.field.component === 'file' && $scope.field.value) {
      contentService.get($scope.field.value)
      .then(function (response) {
        vm.file = response
      })
    }
    $scope.fieldIsRequired = fieldIsRequired()
    $scope.pattern = pattern()
  }

  function downloadFile() {
    alfrescoDownloadService.downloadFile(vm.file.item.node.nodeRef, vm.file.item.location.file)
  }

  // methods that are needed by dynamically compiled templates, in the event that
  // the field depends on other field(s)
  function fieldHasValue(fieldId) {
    var targetField = parentScope.findField('id', fieldId)
    if (!targetField) {
      return true
    }
    var targetFieldValue = targetField.value
    if (!targetFieldValue) {
      return true
    }
    if (targetFieldValue instanceof Array) {
      // if value of target field is actually an array of values,
      // just check if one of them is true
      return targetFieldValue.some(field => field == true)
    }
    return targetFieldValue
  }

  function fieldIsRequired() {
    if ($scope.field.hasOwnProperty('validation')) {
      let validation = JSON.parse($scope.field.validation)
      return (validation.hasOwnProperty('required') && validation.required)
    }
  }

  function pattern() {
    if ($scope.field.hasOwnProperty('validation')) {
      let validation = JSON.parse($scope.field.validation)
      if (validation.hasOwnProperty('max_words')){
        return new RegExp("^(?:\\S+[\\s\\r\\n]*){1," + validation.max_words + "}$")
      }
    }
  }

  function nodeID () {
    return alfrescoNodeService.processNodeRef($scope.field.nodeRef).id
  }
}
