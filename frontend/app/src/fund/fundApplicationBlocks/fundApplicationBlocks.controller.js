//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.fund')
  .controller('FundApplicationBlocksController', ['$scope', FundApplicationBlocksController])

function FundApplicationBlocksController ($scope) {
  var vm = this
  vm.allFields = allFields
  vm.phoneNumber = phoneNumber
  vm.amount = amount
  vm.toggleExpand = toggleExpand

  function allFields () {
    return $scope.application ? [].concat.apply([], $scope.application.blocks.map(block => block.fields)) : null // flatten all fields into one array, https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
  }

  function phoneNumber () {
    return vm.allFields() ? vm.allFields().find(field => field.describes == 'phone_number') : null
  }

  function amount () {
    return vm.allFields() ? vm.allFields().find(field => field.describes == 'amount') : null
  }

  function category () {
    // return vm.allFields() ? vm.allFields().find(field => field.describes == 'phone_number') : null
  }

  function toggleExpand (event) {
    var block = $(event.target).closest('application-block')

    // clean up previous expanded blocks
    $('.od-fund-app-wrapper application-block.expanded').not(block.get(0)).removeClass('expanded')

    // handle newly clicked block
    if (!block.hasClass('expanded')) {
      block.addClass('expanded')
    }
    else {
      block.removeClass('expanded')
    }
  }
}
