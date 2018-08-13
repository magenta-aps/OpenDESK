'use strict'
import '../shared/filters/openeDateFilter'
import '../shared/filters/orderByObjectFilter'
import '../shared/directives/breadcrumb'
import '../shared/directives/nodePicker'
import '../shared/directives/sort'
import filebrowserTemplate from './view/filebrowser.html'
import filebrowserRowTemplate from './view/filebrowserRow.html'
import filebrowserMenuTemplate from './actions/filebrowserMenu.html'

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
  .directive('filebrowserRow', function () {
    return {
      restrict: 'A',
      scope: {
        content: '=',
        showESDH: '=showEsdh',
        isSite: '<',
        loadCheckboxes: '='
      },
      template: filebrowserRowTemplate
    }
  })
  .directive('filebrowserMenu', function () {
    return {
      restrict: 'E',
      scope: {
        content: '=',
        isSite: '<'
      },
      template: filebrowserMenuTemplate,
      controller: 'ActionsController',
      controllerAs: 'vm'
    }
  })
