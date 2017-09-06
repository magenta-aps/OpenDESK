angular
    .module('openDeskApp')
    .controller('ConfigController', ConfigController);

function ConfigController($scope, APP_CONFIG, systemSettingsService) {
    $scope.config = APP_CONFIG.settings;
    $scope.updateSettings = function()
    {
        systemSettingsService.updateSettings($scope.config);
    }
}