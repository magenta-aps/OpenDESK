'use strict'

angular
  .module('openDeskApp.onlyOffice')
  .controller('OnlyOfficePreviewController', OnlyOfficePreviewController)

function OnlyOfficePreviewController ($scope, onlyOfficeService) {
  var vm = this
  activate()

  function activate () {
    var nodeRef = $scope.nodeRef
    onlyOfficeService.displayPreview(nodeRef).then(function (response) {
      vm.isDisplayed = response
    })
  }
}
