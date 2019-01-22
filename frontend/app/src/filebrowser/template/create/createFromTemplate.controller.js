// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.filebrowser')
  .controller('CreateFromTemplateController', ['$scope', '$mdDialog', 'templateService', CreateFromTemplateController])

function CreateFromTemplateController ($scope, $mdDialog, templateService) {
  var vm = this
  var template = templateService.getSelectedTemplate()

  vm.cancelDialog = cancelDialog
  vm.contentType = templateService.getSelectedContentType()
  vm.newContentName = ''
  vm.createContent = createContent

  activate()

  function activate () {
    vm.newContentName = template.name
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function createContent () {
    templateService.createContent(vm.newContentName)
    $mdDialog.cancel()
  }
}
