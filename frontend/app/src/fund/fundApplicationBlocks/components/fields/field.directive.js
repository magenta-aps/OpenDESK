//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular.module('openDeskApp.fund')
  .directive('applicationField', ['$compile', 'FUND_FIELD_RULES', FieldDirectiveConfig])

function FieldDirectiveConfig ($compile, FUND_FIELD_RULES) {
  return {
    restrict: 'E',
    scope: {
      field: '='
    },
    controller: 'ApplicationFieldController',
    controllerAs: 'vm',
    template: null,
    link: function (scope, el) {
      var template = require('./' + (scope.field.component || 'default') + '.html')
      if (scope.field.controlledBy) {
        // if the field is dependent on any other fields,
        // go through each of those dependencies and modify the template
        // accordingly
        Object.entries(scope.field.controlledBy).forEach(function([fieldId, method]) {
          var res = $(template)
          // find the elements we want to modify
          var targetElements = res.find('[data-fieldrule~="' + method + '"]')
          // perform the modification by looking up the appropriate method
          if (FUND_FIELD_RULES.hasOwnProperty(method)) {
            var newElements = FUND_FIELD_RULES[method](targetElements, fieldId)
            newElements.replaceAll(targetElements)
          }
          // remember, we need to reassign a string of HTML as the value of 'result'
          template = res[0].outerHTML
        })
      }
      angular.element(el).html(template)
      $compile(el.contents())(scope)
    }
  }
}
