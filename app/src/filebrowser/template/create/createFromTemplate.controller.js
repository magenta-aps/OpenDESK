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
    }

    function cancelDialog() {
        $mdDialog.cancel();
    }

    function createContentFromTemplate() {
        templateService.createContentFromTemplate(vm.newContentName);
        $mdDialog.cancel();
    }
}