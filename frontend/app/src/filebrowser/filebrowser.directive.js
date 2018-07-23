'use strict'
import '../shared/filters/openeDateFilter'
import filebrowserTemplate from './view/filebrowser.html'

angular
  .module('openDeskApp.filebrowser')
  .directive('odFilebrowser', function () {
    return {
      restrict: 'E',
      scope: {
        type: '@odType'
      },
      template: filebrowserTemplate,
      controller: 'FilebrowserController',
      controllerAs: 'vm'
    }
  })
