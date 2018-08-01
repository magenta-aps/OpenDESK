angular
  .module('openDeskApp')
  .controller('PreviewController', ['$scope', '$mdDialog', 'plugin', PreviewController])

function PreviewController ($scope, $mdDialog, plugin) {
  var vm = this
  vm.plugin = plugin

  $scope.cancel = function () {
    $mdDialog.cancel()
  }

  if (plugin.init)
    plugin.init()
}
