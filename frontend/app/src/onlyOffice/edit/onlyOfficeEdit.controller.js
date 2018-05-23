'use strict';

angular
    .module('openDeskApp.onlyOffice')
    .controller('OnlyOfficeEditController', OnlyOfficeEditController);

function OnlyOfficeEditController($stateParams, onlyOfficeService) {
    var vm = this;

    activate();

    function activate() {
        var nodeRef = $stateParams.nodeRef;
        onlyOfficeService.displayEdit(nodeRef).then(function(response) {
            vm.isDisplayed = response;
        });
    }
}