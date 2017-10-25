'use strict';

angular
    .module('openDeskApp.filebrowser')
    .controller('TemplateListController', TemplateListController);

function TemplateListController($scope, $mdDialog, templateService) {

    var vm = this;

    vm.createContentFromTemplateDialog = createContentFromTemplateDialog;

    function createContentFromTemplateDialog(template, contentType) {
        templateService.setTemplate(template, contentType);
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/template/create/createFromTemplate.view.html',
            controller: 'CreateFromTemplateController',
            controllerAs: 'vm',
            clickOutsideToClose: true
        });
    }
}