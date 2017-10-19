angular
    .module('openDeskApp')
    .controller('ConfigController', ConfigController);

function ConfigController($scope, APP_BACKEND_CONFIG, systemSettingsService) {
    $scope.config = APP_BACKEND_CONFIG;
    $scope.updateSettings = function()
    {
        systemSettingsService.updateSettings($scope.config);
    }
}