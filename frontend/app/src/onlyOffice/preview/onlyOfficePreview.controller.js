'use strict';

angular
    .module('openDeskApp.onlyOffice')
    .controller('OnlyOfficePreviewController', OnlyOfficePreviewController);

function OnlyOfficePreviewController($stateParams, onlyOfficeService) {

    activate();

    function activate() {
        var nodeRef = $stateParams.doc;
        onlyOfficeService.displayPreview(nodeRef);
    }
}