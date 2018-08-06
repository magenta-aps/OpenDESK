'use strict'

angular
  .module('openDeskApp')
  .controller('IconPickerController', ['ICON_CONFIG', '$scope', IconPickerController])

function IconPickerController (ICON_CONFIG, $scope) {
  var vm = this

  vm.selectIcon = selectIcon
  vm.icons = ICON_CONFIG.data

  $scope.selectedIcon = $scope.selectedIcon !== '' ? $scope.selectedIcon : vm.icons[0].name

  function selectIcon (id) {
    $scope.selectedIcon = vm.icons[id].name
  }
}
