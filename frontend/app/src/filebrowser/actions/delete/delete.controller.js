// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../../../shared/services/content.service'

angular
  .module('openDeskApp.filebrowser')
  .controller('DeleteController', ['$rootScope', '$mdDialog', 'data', 'siteService', 'contentService', DeleteController])

function DeleteController ($rootScope, $mdDialog, data, siteService, contentService) {
  var vm = this

  vm.data = data

  vm.cancel = cancel
  vm.delete = deleteContent

  function deleteContent () {
    if (vm.data.contentType !== 'cmis:link')
      deleteFile(vm.data.nodeRef)
    else
      deleteLink(vm.data.destination_link)
  }

  function deleteFile (nodeRef) {
    contentService.delete(nodeRef)
      .then(function () {
        hideAndReload()
      })
  }

  function deleteLink (destinationShortName) {
    siteService.deleteLink(destinationShortName)
      .then(function () {
        hideAndReload()
      })
  }

  function hideAndReload () {
    $rootScope.$broadcast('updateFilebrowser')
    cancel()
  }

  function cancel () {
    $mdDialog.cancel()
  }
}
