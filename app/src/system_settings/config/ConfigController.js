'use strict';

angular
    .module('openDeskApp')
    .controller('ConfigController', ConfigController);

function ConfigController(APP_BACKEND_CONFIG, systemSettingsService) {
    var vm = this;

    vm.config = APP_BACKEND_CONFIG;
    vm.updateSettings = updateSettings;

    vm.addNewDashboardLink = addNewDashboardLink;
    vm.removeDashboardLink = removeDashboardLink;
    
    function updateSettings() {
        systemSettingsService.updateSettings(vm.config);
    }

    function addNewDashboardLink() {
        vm.config.dashboardLink.push({
            icon: '',
            label: '',
            url: '',
            newWindow: false
        });
    }

    function removeDashboardLink(index) {
        vm.config.dashboardLink.splice(index,1);
    }
}