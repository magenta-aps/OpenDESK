'use strict'
import userPanelTemplate from './userPanel.view.html'

angular
  .module('openDeskApp.user')
  .directive('odUserPanel', function () {
    return {
      restrict: 'E',
      scope: {},
      template: userPanelTemplate,
      controller: 'UserController',
      controllerAs: 'vm'
    }
  })
