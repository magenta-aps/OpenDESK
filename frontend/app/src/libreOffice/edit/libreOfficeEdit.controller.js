'use strict'

angular
  .module('openDeskApp.libreOffice')
  .controller('LibreOfficeEditController', ['$stateParams', 'libreOfficeService', LibreOfficeEditController])

function LibreOfficeEditController ($stateParams, libreOfficeService) {
  var vm = this

  activate()

  function activate () {
    var nodeRef = 'workspace://SpacesStore/' + $stateParams.nodeId
    libreOfficeService.getLibreOfficeUrl(nodeRef, 'edit')
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
