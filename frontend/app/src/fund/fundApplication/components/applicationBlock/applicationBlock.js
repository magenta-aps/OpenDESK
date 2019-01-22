//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'
import applicationBlockTemplate from './applicationBlock.html'

angular.module('openDeskApp.fund')
  .component('applicationBlock', {
    template: applicationBlockTemplate,
    controller: applicationBlockController,
    bindings: {
      block: '='
    }
  })

function applicationBlockController () {
  var vm = this

  vm.getTemplate = getTemplate

  function getTemplate (type) {
    return '/app/src/fund/fundApplication/components/fields/' + type + '.html'
  }
}
