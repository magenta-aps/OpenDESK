// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.filebrowser')
  .controller('RenameController', ['$rootScope', '$mdDialog', 'content', 'alfrescoNodeService', RenameController])

function RenameController ($rootScope, $mdDialog, content, alfrescoNodeService) {
  var vm = this

  vm.nodeRef = content.nodeRef
  vm.newName = content.name

  vm.cancel = cancel
  vm.rename = rename

  function rename () {
    alfrescoNodeService.updateName(vm.nodeRef, vm.newName)
      .then(function () {
        $rootScope.$broadcast('updateFilebrowser')
        cancel()
      })
  }

  function cancel () {
    $mdDialog.cancel()
  }
}
