// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.dashboard')
  .controller('DashboardController', ['headerService', 'APP_BACKEND_CONFIG', DashboardController])

function DashboardController (headerService, APP_BACKEND_CONFIG) {
  var vm = this

  vm.links = APP_BACKEND_CONFIG.dashboardLink
  vm.lightenDarkenColor = lightenDarkenColor

  activate()

  function activate () {
    headerService.setTitle('')
  }

  function lightenDarkenColor (index) {
    var col = '#3f51b5'
    var amt = 100 - (index / vm.links.length * 100)

    var usePound = false

    if (col[0] === '#') {
      col = col.slice(1)
      usePound = true
    }

    var num = parseInt(col, 16)

    var r = (num >> 16) + amt

    if (r > 255) r = 255
    else if (r < 0) r = 0

    var b = ((num >> 8) & 0x00FF) + amt

    if (b > 255) b = 255
    else if (b < 0) b = 0

    var g = (num & 0x0000FF) + amt

    if (g > 255) g = 255
    else if (g < 0) g = 0

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
  }
}
