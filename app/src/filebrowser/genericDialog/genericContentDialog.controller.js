'use strict';

angular
    .module('openDeskApp.filebrowser')
    .controller('GenericContentDialogController', GenericContentDialogController);

function GenericContentDialogController(data, $rootScope, $mdDialog, filebrowserService) {

    var vm = this;

    vm.data = data;

    vm.cancelDialog = cancelDialog;
    vm.destinationNodeRef = '';
    vm.dialogResponse = dialogResponse;

    function cancelDialog() {
        $mdDialog.cancel();
    }

    function dialogResponse() {
        filebrowserService.genericContentAction(vm.data.contentAction.toLowerCase(), vm.data.sourceNodeRefs, vm.destinationNodeRef,
            vm.data.parentNodeRef).then(function(response) {
            if (response.data.results[0].fileExist) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Der er allerede en fil med samme navn i mappen du valgte.')
                        .ariaLabel('Eksisterer allerede')
                        .ok('Ok')
                );
            }
            cancelDialog();
            $rootScope.$broadcast('updateFilebrowser');
            //hideDialogAndReloadContent();
        });
    }

}