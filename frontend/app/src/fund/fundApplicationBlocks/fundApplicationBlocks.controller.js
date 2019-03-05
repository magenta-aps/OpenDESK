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

  vm.toggleExpand = toggleExpand
  // 53e8664e-e1fb-40d0-9104-019d57f06bee

  function toggleExpand (event) {
    var block = $(event.target).closest('md-card')

    // clean up previous expanded blocks
    $('.od-fund-app-wrapper .fund-block-placeholder').remove()
    $('.od-fund-app-wrapper md-card.expanded').not(block.get(0)).removeClass('expanded')

    // handle newly clicked block
    if (!block.hasClass('expanded')) {
      var w = block.get(0).offsetWidth
      var h = block.get(0).offsetHeight
      var placeholder = $('<div/>', {
        style: 'width:' + w + 'px;height:' + h + 'px;',
        'class': 'fund-block-placeholder'
      })
      block.before(placeholder)
      block.addClass('expanded')
    }
    else {
      block.prev('.fund-block-placeholder').remove()
      block.removeClass('expanded')
    }
  }
}
