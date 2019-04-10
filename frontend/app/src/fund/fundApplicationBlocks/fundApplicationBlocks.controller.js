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
  vm.allFields = $scope.allFields
  vm.phoneNumber = phoneNumber
  vm.amount = amount
  vm.toggleExpand = toggleExpand
  vm.toggleExpandPrevious = toggleExpandPrevious

  function phoneNumber () {
    return vm.allFields().length ? vm.allFields().find(field => field.describes == 'phone_number') : {}
  }

  function amount () {
    return vm.allFields().length ? vm.allFields().find(field => field.describes == 'amount') : {}
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

  function toggleExpandPrevious (event) {
    var row = $(event.target).closest('tr')

    // handle newly clicked row
    if (!row.hasClass('osflow-table__tr--open')) {
      row.addClass('osflow-table__tr--open'),
      row.next('.osflow-table__tr--details').removeAttr('hidden')
    }
    else {
      row.removeClass('osflow-table__tr--open'),
      row.next('.osflow-table__tr--details').attr('hidden', 'hidden')
    }
  }

}
