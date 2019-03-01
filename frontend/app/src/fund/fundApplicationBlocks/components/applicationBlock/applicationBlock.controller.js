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
  .controller('ApplicationBlockController', ['$scope', ApplicationBlockController])

function ApplicationBlockController ($scope) {
  var vm = this

  vm.getTemplate = getTemplate
  vm.editField = editField
  vm.saveField = saveField
  vm.cancelEdit = cancelEdit
  vm.isEditing = false
  vm.origValue = null

  function getTemplate (type) {
    return '/app/src/fund/fundApplicationBlocks/components/fields/' + type + '.html'
  }

  function editField () {
    vm.origValue = vm.block
    vm.isEditing = true
  }

  function saveField () {
    vm.isEditing = false
  }

  function cancelEdit () {
    vm.block = vm.origValue
    vm.isEditing = false
  }
}
