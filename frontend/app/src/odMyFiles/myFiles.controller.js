'use strict';

angular
    .module('openDeskApp.myFiles')
    .controller('MyFilesController', MyFilesController);

function MyFilesController(sessionService) {

    var vm = this;

    activate();

    function activate() {
        vm.path = "/User Homes/" + sessionService.getUserInfo().user.userName;
    }
}