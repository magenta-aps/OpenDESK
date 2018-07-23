angular
  .module('openDeskApp')
  .controller('DialogController', ['$scope', '$mdDialog', 'plugin', DialogController])

function DialogController ($scope, $mdDialog, plugin) {
  var vm = this
  vm.plugin = plugin

  $scope.cancel = function () {
    $mdDialog.cancel()
  }

  if (plugin.init)
    plugin.init()
}
