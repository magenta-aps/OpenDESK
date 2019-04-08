//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular.module('openDeskApp.fund')
  .directive('applicationField', ['$compile', '$templateRequest', 'FUND_FIELD_RULES', FieldDirectiveConfig])

function FieldDirectiveConfig ($compile, $templateRequest, FUND_FIELD_RULES) {
  return {
    restrict: 'E',
    scope: {
      field: '='
    },
    controller: 'ApplicationFieldController',
    controllerAs: 'vm',
    template: null,
    link: FieldLinkFunction
  }
}

function FieldLinkFunction (scope, el) {
  $templateRequest('/app/src/fund/fundApplicationBlocks/components/fields/' + scope.field.component + '.html')
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
    $compile(el.contents())(scope)
  })
}
