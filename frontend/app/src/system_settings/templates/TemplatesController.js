'use strict'
import newTemplateTemplate from './view/newTemplate.tmpl.html'

angular
  .module('openDeskApp')
  .controller('TemplatesController', ['siteService', '$mdDialog', '$scope', 'systemSettingsService',
    TemplatesController])

function TemplatesController (siteService, $mdDialog, $scope, systemSettingsService) {
  var vm = this

  vm.createTemplate = createTemplate
  vm.newTemplate = newTemplate
  vm.deleteSite = deleteSite
  vm.deleteSiteDialog = deleteSiteDialog

  function createTemplate (name, description) {
    siteService.createTemplate(name, description).then(function (response) {
      $scope.templateSites.push(response[0])
      $mdDialog.hide()
    })
  }

  function newTemplate (event) {
    $mdDialog.show({
      template: newTemplateTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      targetEvent: event,
      clickOutsideToClose: true
    })
  }

  function deleteSite (shortName) {
    return siteService.delete(shortName)
  }

  function deleteSiteDialog (siteName) {
    var confirm = $mdDialog.confirm()
      .title('Vil du slette denne skabelon?')
      .textContent('Skabelonen og alle dets filer vil blive slettet')
      .ok('Ja')
      .cancel('Annullér')

    $mdDialog.show(confirm).then(
      function () {
        vm.deleteSite(siteName).then(function () {
          systemSettingsService.getTemplates().then(function (response) {
            $scope.templateSites = response
            $mdDialog.hide()
          })
        })
      },
      function () {
        console.log('cancelled delete')
      }
    )
  }
}
