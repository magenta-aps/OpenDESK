//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular.module('openDeskApp.fund')
  .directive('applicationField', function ($compile, $templateRequest, fundApplicationEditing, FUND_FIELD_RULES) {
    return {
      restrict: 'E',
      scope: {
        field: '='
      },
      template: null,
      link: function (scope, el) {
        $templateRequest('/app/src/fund/fundApplicationBlocks/components/fields/' + scope.field.type + '.html')
        .then(function (result) {
          // if the field is not dependent on any other fields, just return the template
          if (!scope.field.controlledBy) {
            return result
          }
          // otherwise, go through each of the dependencies and modify the template
          // accordingly
          Object.entries(scope.field.controlledBy).forEach(function([fieldId, method]) {
            var res = $(result)
            // find the elements we want to modify
            var targetElements = res.find('[data-fieldrule~="' + method + '"]')
            // perform the modification by looking up the appropriate method
            if (FUND_FIELD_RULES.hasOwnProperty(method)) {
              var newElements = FUND_FIELD_RULES[method](targetElements, fieldId)
              newElements.replaceAll(targetElements)
            }
            // remember, we need to reassign a string of HTML as the value of 'result'
            result = res[0].outerHTML
          })
          return result
        }, function (error) {
          // there was an error loading the template; return something else
          return '<p><strong>{{ field.label }}:</strong> Der skete en fejl ved indlæsning af feltet</p>'
        })
        .then(function (template) {
          angular.element(el).html(template)
          // construct scope for element
          scope.isEditing = fundApplicationEditing // inject dependency
          var parentScope = scope.$parent.$parent.$parent.$parent // TODO: this creates a tight coupling

          // methods that are needed by dynamically compiled templates, in the event that
          // the field depends on other field(s)
          scope.fieldHasValue = function (fieldId) {
            if (!parentScope.vm.allFields()) {
              return true
            }
            var targetField = parentScope.vm.allFields().find(field => field.id == fieldId)
            if (!targetField) {
              return true
            }
            var targetFieldValue = targetField.value
            if (!targetFieldValue) {
              return true
            }
            if (targetFieldValue instanceof Array) {
              // if value of target field is actually an array of values,
              // just check if one of them is true
              console.log('array value', targetFieldValue)
              return targetFieldValue.some(field => field == true)
            }
            console.log('flat value', targetFieldValue)
            return targetFieldValue
          }
          $compile(el.contents())(scope)
        })
        // $compile(angular.element(el).html(scope.template))(scope)
      }
    }
  })
