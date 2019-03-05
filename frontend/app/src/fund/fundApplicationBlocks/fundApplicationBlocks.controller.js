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

function FundApplicationBlocksController ($scope, $rootScope) {
  var vm = this

  vm.toggleExpand = toggleExpand

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
