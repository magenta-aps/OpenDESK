'use strict';

angular
    .module('openDeskApp.onlyOffice')
    .controller('OnlyOfficeController', OnlyOfficeController);

function OnlyOfficeController(onlyOfficeService) {
    var vm = this;

    activate();

    function activate() {
        onlyOfficeService.preparePreview().then(function (response) {
            vm.docConfig = response;
        });
        vm.onlyOfficeUrl = "https://documentserver.example.org";
    }
}