'use strict'
import headerTemplate from './header.view.html'

angular
  .module('openDeskApp.header')
  .directive('odHeader', function () {
    return {
      restrict: 'E',
      scope: {},
      template: headerTemplate,
      controller: 'HeaderController',
      controllerAs: 'vm'
    }
  })
