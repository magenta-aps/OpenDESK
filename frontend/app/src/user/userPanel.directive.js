'use strict'

angular
  .module('openDeskApp.user')
  .directive('odUserPanel', function () {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/src/user/userPanel.view.html',
      controller: 'UserController',
      controllerAs: 'vm'
    }
  })
