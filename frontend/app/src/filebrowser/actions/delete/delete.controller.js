'use strict';

angular
  .module('openDeskApp.filebrowser')
  .controller('DeleteController', DeleteController);
  
function DeleteController($rootScope, $mdDialog, content, siteService) {
  var vm = this;

  vm.content = content;

  vm.cancel = cancel;
  vm.delete = deleteContent;

  function deleteContent() {
    if(vm.content.contentType != 'cmis:link') {
      deleteFile(vm.content.nodeRef);
    } else {
      deleteLink(vm.content.nodeid, vm.content.destination_nodeid);
    }
  }

  function deleteFile(nodeRef) {
    siteService.deleteFile(nodeRef)
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
