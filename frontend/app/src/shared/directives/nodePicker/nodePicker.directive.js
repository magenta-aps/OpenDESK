'use strict'
import nodePickerTemplate from './nodePicker.view.html'

angular
  .module('openDeskApp')
  .directive('nodePicker', function () {
    return {
      restrict: 'E',
      scope: {
        currentNodeRef: '=root',
        selectedNode: '=model'
      },
      template: nodePickerTemplate,
      controller: 'NodePickerController',
      controllerAs: 'vm'
    }
  })
