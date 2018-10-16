'use strict'

angular
  .module('openDeskApp.libreOffice')
  .controller('LibreOfficePreviewController', ['$scope', 'libreOfficeService', LibreOfficePreviewController])

function LibreOfficePreviewController ($scope, libreOfficeService) {
  var vm = this

  activate()

  function activate () {
    libreOfficeService.getLibreOfficeUrl($scope.nodeRef, 'view')
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
