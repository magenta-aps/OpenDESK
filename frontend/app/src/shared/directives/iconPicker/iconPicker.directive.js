'use strict'

angular
  .module('openDeskApp')
  .directive('iconPicker', function () {
    return {
      restrict: 'E',
      scope: {
        selectedIcon: '=selectedIcon'
      },
      templateUrl: 'app/src/shared/directives/iconPicker/iconPicker.view.html',
      controller: 'IconPickerController',
      controllerAs: 'vm'
    }
  })
