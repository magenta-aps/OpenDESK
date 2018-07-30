'use strict'
import iconPickerTemplate from './iconPicker.view.html'

angular
  .module('openDeskApp')
  .directive('iconPicker', function () {
    return {
      restrict: 'E',
      scope: {
        selectedIcon: '=selectedIcon'
      },
      template: iconPickerTemplate,
      controller: 'IconPickerController',
      controllerAs: 'vm'
    }
  })
