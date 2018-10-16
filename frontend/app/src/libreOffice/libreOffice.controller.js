'use strict'
import '../shared/services/nodeRefUtils.service'

angular
  .module('openDeskApp.libreOffice')
  .controller('LibreOfficeController', ['$stateParams', 'libreOfficeService', 'nodeRefUtilsService', LibreOfficeController])

function LibreOfficeController ($stateParams, libreOfficeService, nodeRefUtilsService) {
  var vm = this

  activate()

  function activate () {
    vm.nodeId = nodeRefUtilsService.getId($stateParams.nodeRef)
    libreOfficeService.getLibreOfficeUrl($stateParams.nodeRef, 'edit')
      .then(function (response) {
        if (response) {
          vm.libreOfficeUrl = response
          vm.height = '100%'
          vm.isDisplayed = true
        } else {
          vm.isDisplayed = false
        }
      })
  }
}
