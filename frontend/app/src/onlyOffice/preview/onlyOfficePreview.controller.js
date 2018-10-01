'use strict'

angular
  .module('openDeskApp.onlyOffice')
  .controller('OnlyOfficePreviewController', ['$scope', 'onlyOfficeService', OnlyOfficePreviewController])

function OnlyOfficePreviewController ($scope, onlyOfficeService) {
  var vm = this
  activate()

  function activate () {
    var sharedId = $scope.sharedId
    if (sharedId) {
      onlyOfficeService.displayNoAuthPreview(sharedId)
        .then(function (response) {
          vm.isDisplayed = response
        })
    }
    else {
      var nodeRef = $scope.nodeRef
      onlyOfficeService.displayPreview(nodeRef)
        .then(function (response) {
          vm.isDisplayed = response
        })
    }
  }
}
