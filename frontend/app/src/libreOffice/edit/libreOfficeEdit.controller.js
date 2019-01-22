// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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
