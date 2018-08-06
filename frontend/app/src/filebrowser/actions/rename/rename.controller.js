'use strict'

angular
  .module('openDeskApp.filebrowser')
  .controller('RenameController', ['$rootScope', '$mdDialog', 'content', 'siteService', RenameController])

function RenameController ($rootScope, $mdDialog, content, siteService) {
  var vm = this

  vm.nodeRef = content.nodeRef
  vm.newName = content.name

  vm.cancel = cancel
  vm.rename = rename

  function rename () {
    var props = {
      prop_cm_name: vm.newName
    }

    siteService.updateNode(vm.nodeRef, props)
      .then(function () {
        $rootScope.$broadcast('updateFilebrowser')
        cancel()
      })
  }

  function cancel () {
    $mdDialog.cancel()
  }
}
