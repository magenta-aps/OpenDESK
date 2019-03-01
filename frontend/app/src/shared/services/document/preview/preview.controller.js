// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .controller('PreviewController', ['$scope', '$mdDialog', 'plugin', 'pdfjsViewer', PreviewController])

function PreviewController ($scope, $mdDialog, plugin, pdfjsViewer) {
  var vm = this
  vm.plugin = plugin
  vm.pdfjsViewer = pdfjsViewer

  $scope.cancel = function () {
    $mdDialog.cancel()
  }

  if (plugin.init)
    plugin.init()
    pdfjsViewer.init()
}
