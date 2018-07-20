'use strict'
import appDrawerTemplate from './appDrawer.view.html'

angular
  .module('openDeskApp.appDrawer')
  .directive('odAppDrawer', function () {
    return {
      restrict: 'E',
      scope: false,
      template: appDrawerTemplate,
      controller: 'AppDrawerController',
      controllerAs: 'vm'
    }
  })
