'use strict'

angular
  .module('openDeskApp.libreOffice')
  .controller('LibreOfficePreviewController', ['$stateParams', 'libreOfficeService', LibreOfficePreviewController])

function LibreOfficePreviewController ($stateParams, libreOfficeService) {
  var vm = this

  activate()

  function activate () {
    libreOfficeService.getLibreOfficeUrl($stateParams.nodeRef, 'view')
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
