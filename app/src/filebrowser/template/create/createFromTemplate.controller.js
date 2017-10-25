'use strict';

angular
    .module('openDeskApp.filebrowser')
    .controller('CreateFromTemplateController', CreateFromTemplateController);

function CreateFromTemplateController($scope, $mdDialog, templateService) {

    var vm = this;
    var template = templateService.getSelectedTemplate();

    vm.cancelDialog = cancelDialog;
    vm.contentType = templateService.getSelectedContentType();
    vm.newContentName = '';
    vm.createContentFromTemplate = createContentFromTemplate;

    activate();

    function activate() {
        vm.newContentName = template.name;
        console.log('createFromTemplateController');
    }

    function cancelDialog() {
        $mdDialog.cancel();
    }

    function createContentFromTemplate() {
        templateService.createContentFromTemplate(vm.newContentName);
        $mdDialog.cancel();
    }

    // function createFolder(folderName) {
    //     var props = {
    //         prop_cm_name: folderName,
    //         prop_cm_title: folderName,
    //         alf_destination: folderNodeRef
    //     };
    //     templateService.createFolder("cm:folder", props).then(function (response) {
    //         hideDialogAndReloadContent();
    //     });
    // }
}