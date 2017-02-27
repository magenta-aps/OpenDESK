angular
    .module('openDeskApp.systemsettings')
    .controller('SystemSettingsController', SystemSettingsCtrl);

function SystemSettingsCtrl(systemSettingsPagesService, sessionService) {
    var vm = this;
    vm.isAdmin = sessionService.isAdmin();
    vm.pages = systemSettingsPagesService.getPages()
        .filter(function (page) {
            return true;
        });
}