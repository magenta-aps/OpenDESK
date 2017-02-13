angular
    .module('openDeskApp')
    .controller('FooterController', FooterController);

function FooterController($scope, authService, serverVersionService) {
    var vm = this;

    //activate();

    function activate() {
        vm.isDevelopmentMode = document.location.hostname == "localhost" ||
            document.location.hostname == "test.opendesk.dk";

        serverVersionService.getGitDetails().then(function (details) {
            vm.gitCommitId = details.gitCommitId;
            vm.gitBranch = details.gitBranch;
        });
    }
}