'use strict'

angular
  .module('openDeskApp')
  .directive('sort', function () {
    return {
      restrict: 'A',
      transclude: true,
      template: '<a ng-click="onClick()">' +
                '<span ng-transclude></span>' +
                '<i class="material-icons">{{reverse ? "keyboard_arrow_down" : "keyboard_arrow_up"}}</i>' +
                '</a>',
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
