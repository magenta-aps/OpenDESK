'use strict';

angular
    .module('openDeskApp')
    .controller('IconPickerController', IconPickerController);

function IconPickerController(ICON_CONFIG, $scope, $mdMenu) {
    var vm = this;

    vm.selectIcon = selectIcon;
    vm.icons = ICON_CONFIG.data;

    $scope.selectedIcon = $scope.selectedIcon !== '' ? $scope.selectedIcon : vm.icons[0].name;

    function activate() {

    }

    function selectIcon(id) {
        $scope.selectedIcon = vm.icons[id].name;
    }
}