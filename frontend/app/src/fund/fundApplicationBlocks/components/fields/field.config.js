//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular.module('openDeskApp.fund')
.constant('FUND_FIELD_RULES', {
  toggle: function (targetElements, controlledBy) {
    var oldNgDisabled = targetElements.attr('ng-disabled')
    var dependsOnField = 'fieldHasValue(\'' + controlledBy + '\')'
    var newNgDisabled = oldNgDisabled ? '(' + oldNgDisabled + ')' + ' || ' + dependsOnField : dependsOnField
    targetElements.attr('ng-disabled', newNgDisabled)
    return targetElements
  },
  inverseToggle: function (targetElements, controlledBy) {
    var oldNgDisabled = targetElements.attr('ng-disabled')
    var dependsOnField = '!fieldHasValue(\'' + controlledBy + '\')'
    var newNgDisabled = oldNgDisabled ? '(' + oldNgDisabled + ')' + ' || ' + dependsOnField : dependsOnField
    targetElements.attr('ng-disabled', newNgDisabled)
    return targetElements
  }
})
