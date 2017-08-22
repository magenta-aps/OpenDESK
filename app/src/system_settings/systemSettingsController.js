angular
    .module('openDeskApp.systemsettings')
    .controller('SystemSettingsController', SystemSettingsCtrl);

function SystemSettingsCtrl(systemSettingsPagesService, sessionService, systemSettingsService, $scope,
                            browserService, $translate) {
    var vm = this;

    browserService.setTitle($translate.instant('ADMIN.ADMINISTRATION_PAGES'));

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