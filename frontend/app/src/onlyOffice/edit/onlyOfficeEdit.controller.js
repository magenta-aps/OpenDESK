'use strict';

angular
    .module('openDeskApp.onlyOffice')
    .controller('OnlyOfficeEditController', OnlyOfficeEditController);

function OnlyOfficeEditController($stateParams, onlyOfficeService) {

    activate();

    function activate() {
        var nodeRef = $stateParams.nodeRef;
        onlyOfficeService.displayEdit(nodeRef);
    }
}