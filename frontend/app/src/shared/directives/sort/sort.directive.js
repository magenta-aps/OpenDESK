'use strict'
import sortTemplate from './sort.html'

angular
  .module('openDeskApp')
  .directive('sort', function () {
    return {
      restrict: 'A',
      transclude: true,
      template: sortTemplate,
      scope: {
        order: '=',
        by: '=',
        reverse: '='
      },
      link: function (scope, element, attrs) {
        scope.onClick = function () {
          if (scope.order === scope.by) {
            scope.reverse = !scope.reverse
          } else {
            scope.by = scope.order
            scope.reverse = false
          }
        }
      }
    }
  })
