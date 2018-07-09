'use strict'

angular
  .module('openDeskApp.filebrowser')
  .controller('GenericContentDialogController', GenericContentDialogController)

function GenericContentDialogController (data, $rootScope, $mdDialog, filebrowserService) {
  var vm = this

  vm.data = data

  vm.cancelDialog = cancelDialog
  vm.destinationNodeRef = ''
  vm.dialogResponse = dialogResponse
  vm.uploading = false

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function dialogResponse () {
    vm.uploading = true
    filebrowserService.genericContentAction(vm.data.contentAction.toLowerCase(),
      vm.data.sourceNodeRefs, vm.destinationNodeRef.nodeRef, vm.data.parentNodeRef)
      .then(function (response) {
        if (response.data.results[0].fileExist)
          $mdDialog.show(
            $mdDialog.alert()
              .clickOutsideToClose(true)
              .title('Der er allerede en fil med samme navn i mappen du valgte.')
              .ariaLabel('Eksisterer allerede')
              .ok('Ok')
          )

        vm.uploading = false
        cancelDialog()
        $rootScope.$broadcast('updateFilebrowser')
      })
  }
}
