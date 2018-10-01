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
      deleteLink(vm.data.nodeid, vm.data.destination_nodeid)
  }

  function deleteFile (nodeRef) {
    contentService.delete(nodeRef)
      .then(function () {
        hideAndReload()
      })
  }

  function deleteLink (source, destination) {
    siteService.deleteLink(source, destination)
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
