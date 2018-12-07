// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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
