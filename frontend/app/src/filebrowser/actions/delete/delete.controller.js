'use strict';

angular
  .module('openDeskApp.filebrowser')
  .controller('DeleteController', DeleteController);
  
function DeleteController($rootScope, $mdDialog, data, siteService, ContentService) {
  var vm = this;

  vm.data = data;

  vm.cancel = cancel;
  vm.delete = deleteContent;

  function deleteContent() {
    if(vm.data.contentType != 'cmis:link') {
      deleteFile(vm.data.nodeRef);
    } else {
      deleteLink(vm.data.nodeid, vm.data.destination_nodeid);
    }
  }

  function deleteFile(nodeRef) {
    ContentService.delete(nodeRef)
    .then(function () {
      hideAndReload();
    });
  }

  function deleteLink(source, destination) {
    siteService.deleteLink(source, destination)
    .then(function () {
      hideAndReload();
    });
  }

  function hideAndReload() {
    $rootScope.$broadcast('updateFilebrowser');
    cancel();
  }

  function cancel() {
    $mdDialog.cancel();
  }
}
