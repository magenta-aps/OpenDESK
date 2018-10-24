'use strict'
import '../../shared/filters/openeDateFilter'
import '../../shared/filters/orderByObjectFilter'
import newTemplateTemplate from './view/newTemplate.tmpl.html'

angular
  .module('openDeskApp')
  .controller('TemplatesController', ['$mdDialog', '$scope', 'siteService', 'systemSettingsService',
    TemplatesController])

function TemplatesController ($mdDialog, $scope, siteService, systemSettingsService) {
  var vm = this

  vm.createTemplate = createTemplate
  vm.newTemplate = newTemplate
  vm.deleteSite = deleteSite
  vm.deleteSiteDialog = deleteSiteDialog
  vm.templateSites = []
  vm.isLoaded = false

  activate()

  function activate () {
    loadTemplates()
  }

  function createTemplate (name, description) {
    siteService.createTemplate(name, description).then(function (response) {
      vm.templateSites.push(response)
      $mdDialog.hide()
    })
  }

  function loadTemplates () {
    systemSettingsService.getTemplates()
      .then(function (response) {
        vm.templateSites = response
        vm.isLoaded = true
      })
  }

  function newTemplate () {
    $mdDialog.show({
      template: newTemplateTemplate,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
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
            vm.templateSites = response
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
