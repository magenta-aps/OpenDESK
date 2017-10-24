'use strict';

angular
    .module('openDeskApp.filebrowser')
    .controller('TemplateListController', TemplateListController);

function TemplateListController($scope, $mdDialog) {

    var vm = this;

    vm.createContentFromTemplateDialog = createContentFromTemplateDialog;

    activate();

    function activate() {
        console.log('templateListController');
    }

    function createContentFromTemplateDialog(template, contentType) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/template/create/createFromTemplate.view.html',
            controller: 'CreateFromTemplateController',
            controllerAs: 'vm',
            locals: {
                // template: template,
                contentType: contentType
            },
            // preserveScope: true,
            clickOutsideToClose: true
        });
    }
}