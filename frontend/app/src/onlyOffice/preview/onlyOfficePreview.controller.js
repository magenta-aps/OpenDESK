// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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
