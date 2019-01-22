// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular.module('openDeskApp.metadata')
  .controller('MetadataController', ['$mdToast', '$scope', '$state', '$translate', 'groupService', 'metadataService',
    MetadataController])

function MetadataController ($mdToast, $scope, $state, $translate, groupService, metadataService) {
  var vm = this
  vm.editMetadata = editMetadata
  vm.saveMetadata = saveMetadata

  activate()

  function activate () {
    var node = $scope.node
    vm.extraInfo = node.extraInfo
    vm.properties = node.node.properties
    vm.nodeId = node.nodeId
    vm.params = {
      doc: vm.nodeId
    }
    metadataService.getPropertyDefinitions(vm.nodeId)
      .then(function (response) {
        vm.propertyDefinitions = response
      })
    metadataService.getPropertyUIDefinitions(vm.nodeId)
      .then(function (response) {
        vm.propertyUIDefinitions = response
        vm.modelProperties = {}
        for (var property in vm.propertyUIDefinitions.edit.properties)
          if (vm.propertyUIDefinitions.edit.properties.hasOwnProperty(property))
            // This is temporary and the backend should take care of sending the name without the file extension
            if (property === 'cm:name') {
              var name = vm.properties[property]
              var fileExtensionIndex = name.lastIndexOf('.')
              vm.modelProperties[property] = name.substr(0, fileExtensionIndex)
              vm.nameExtension = name.substr(fileExtensionIndex)
            } else { vm.modelProperties[property] = vm.properties[property] }
      })
    vm.openMemberInfo = groupService.openMemberInfo
  }

  function editMetadata () {
    $state.go('editDocument', vm.params)
  }

  function saveMetadata () {
    // This is temporary and the backend should take care of sending the name without the file extension
    vm.modelProperties['cm:name'] += vm.nameExtension

    metadataService.updateProperties(vm.nodeId, vm.modelProperties)
    $state.go('document', vm.params)
    $mdToast.show(
      $mdToast.simple()
        .textContent($translate.instant('COMMON.DETAILS_SAVED'))
        .hideDelay(3000)
    )
  }
}
