'use strict';

angular
    .module('openDeskApp.onlyOffice')
    .controller('OnlyOfficePreviewController', OnlyOfficePreviewController);

function OnlyOfficePreviewController($stateParams, onlyOfficeService) {

    var vm = this;
    activate();

    function activate() {
        var nodeRef = $stateParams.doc;
        onlyOfficeService.displayPreview(nodeRef).then(function(response) {
             vm.isDisplayed = response;
        });
    }
}