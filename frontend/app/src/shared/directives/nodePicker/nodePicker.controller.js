// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp')
  .controller('NodePickerController', ['$scope', 'nodePickerService', NodePickerController])

function NodePickerController ($scope, nodePickerService) {
  var vm = this

  vm.browseParent = browseParent
  vm.browseChild = browseChild
  vm.pickNode = pickNode
  vm.equalsSelectedNode = equalsSelectedNode
  vm.hasParent = hasParent
  vm.isFolder = isFolder
  vm.currentNode = []

  activate()

  function activate () {
    vm.currentNode.nodeRef = $scope.currentNodeRef
    nodePickerService.getNodeInfo(vm.currentNode)
      .then(function (currentNode) {
        vm.currentNode = currentNode
      })
  }

  function browseParent () {
    $scope.selectedNode = undefined
    nodePickerService.getNodeInfo(vm.currentNode.parent)
      .then(function (currentNode) {
        vm.currentNode = currentNode
      })
  }

  function browseChild (child) {
    $scope.selectedNode = undefined
    nodePickerService.getNodeInfo(child)
      .then(function (currentNode) {
        vm.currentNode = currentNode
      })
  }

  function hasParent () {
    return vm.currentNode.parent !== undefined || vm.currentNode.rootName !== undefined
  }

  function isFolder (node) {
    return node.contentType === 'cmis:folder' || node.rootName !== undefined
  }

  function pickNode (node) {
    if (equalsSelectedNode(node))
      $scope.selectedNode = undefined
    else if (node.nodeRef !== undefined)
      $scope.selectedNode = node
  }

  function equalsSelectedNode (node) {
    if ($scope.selectedNode === undefined || node === undefined)
      return false

    if ($scope.selectedNode.nodeRef !== undefined && node.nodeRef !== undefined)
      if ($scope.selectedNode.nodeRef === node.nodeRef)
        return true

    if ($scope.selectedNode.rootName !== undefined && node.rootName !== undefined)
      if ($scope.selectedNode.rootName === node.rootName)
        return true

    return false
  }
}
