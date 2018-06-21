'use strict';

angular
    .module('openDeskApp.onlyOffice')
    .controller('OnlyOfficeEditController', OnlyOfficeEditController);

function OnlyOfficeEditController($stateParams, onlyOfficeService) {
    var vm = this;

    activate();

    function activate() {
        var nodeId = $stateParams.nodeRef;
        onlyOfficeService.displayEdit(nodeId).then(function(response) {
            vm.isDisplayed = response;
        });
    }
}