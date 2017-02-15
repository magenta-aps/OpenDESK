angular
    .module('openDeskApp')
    .controller('SettingsController', SettingsController)
    .directive('odSettings', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/app/src/odSettings/view/settings.html'
        };
    });

function goto(path) {

}

function SettingsController($scope, $log) {
    var vm = this;

    vm.on = false;
    vm.toggleSettings = function () {
        vm.on = !vm.on;
    };

    var originatorEv;
    vm.openMenu = function ($mdOpenMenu, event) {
        originatorEv = event;
        $mdOpenMenu(event);
    };

};
