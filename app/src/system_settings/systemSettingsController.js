angular
    .module('openDeskApp.systemsettings')
    .controller('SystemSettingsController', SystemSettingsCtrl);

function SystemSettingsCtrl(systemSettingsPagesService, sessionService, systemSettingsService, $scope) {
    var vm = this;

    $scope.templateSites = [];

    function loadTemplates() {
        systemSettingsService.getTemplates().then (function(response) {
            $scope.templateSites = response;
        });
    }
    loadTemplates();

    vm.isAdmin = sessionService.isAdmin();

    vm.pages = systemSettingsPagesService.getPages()
        .filter(function (page) {
            return true;
        });



}