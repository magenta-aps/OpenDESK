'use strict'
import '../shared/filters/openeDateFilter'
import '../shared/filters/orderByObjectFilter'
import '../shared/directives/breadcrumb'
import '../shared/directives/nodePicker'
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
