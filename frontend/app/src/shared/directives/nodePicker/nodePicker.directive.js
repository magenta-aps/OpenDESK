'use strict'

angular
  .module('openDeskApp')
  .directive('nodePicker', function () {
    return {
      restrict: 'E',
      scope: {
        currentNodeRef: '=root',
        selectedNode: '=model'
      },
      templateUrl: 'app/src/shared/directives/nodePicker/nodePicker.view.html',
      controller: 'NodePickerController',
      controllerAs: 'vm'
    }
  })
