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
