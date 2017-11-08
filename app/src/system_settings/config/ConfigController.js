'use strict';

angular
    .module('openDeskApp')
    .controller('ConfigController', ConfigController);

function ConfigController(APP_BACKEND_CONFIG, systemSettingsService) {
    var vm = this;

    vm.config = APP_BACKEND_CONFIG;
    vm.updateSettings = updateSettings;
    
    function updateSettings() {
        systemSettingsService.updateSettings(vm.config);
    }
}