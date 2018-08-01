'use strict'
import createFromTemplateTemplate from '../create/createFromTemplate.view.html'

angular
  .module('openDeskApp.filebrowser')
  .controller('TemplateListController', ['$scope', '$mdDialog', 'templateService', TemplateListController])

function TemplateListController ($scope, $mdDialog, templateService) {
  var vm = this

  vm.createContentFromTemplateDialog = createContentFromTemplateDialog

  activate()

  function activate () {
  }

  function createContentFromTemplateDialog (template, contentType) {
    templateService.setTemplate(template, contentType)

    $mdDialog.show({
      template: createFromTemplateTemplate,
      controller: 'CreateFromTemplateController',
      controllerAs: 'vm',
      clickOutsideToClose: true
    })
  }
}
