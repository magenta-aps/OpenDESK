'use strict'

angular.module('openDeskApp.metadata')
  .controller('MetadataController', ['$scope', '$state', 'groupService', 'metadataService', MetadataController])

function MetadataController ($scope, $state, groupService, metadataService) {
  var vm = this
  vm.editMetadata = editMetadata
  vm.saveMetadata = saveMetadata

  activate()

  function activate () {
    var node = $scope.node
    vm.extraInfo = node.extraInfo
    vm.properties = node.node.properties
    vm.nodeId = node.nodeId
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
            vm.modelProperties[property] = vm.properties[property]
      })
    vm.openMemberInfo = groupService.openMemberInfo
  }

  function editMetadata () {
    var params = {
      doc: vm.nodeId
    }
    $state.go('editDocument', params)
  }

  function saveMetadata () {
    metadataService.updateProperties(vm.nodeId, vm.modelProperties)
  }
}
