'use strict'

angular
  .module('openDeskApp.filebrowser')
  .controller('CreateFromTemplateController', CreateFromTemplateController)

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
