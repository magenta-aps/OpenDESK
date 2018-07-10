'use strict'

angular
  .module('openDeskApp.header')
  .directive('odHeader', function () {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/src/header/header.view.html',
      controller: 'HeaderController',
      controllerAs: 'vm'
    }
  })
