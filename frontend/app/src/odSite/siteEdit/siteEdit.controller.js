// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.site')
  .controller('SiteEditController', ['sitedata', '$state', '$mdDialog', 'siteService', '$mdToast', SiteEditController])

function SiteEditController (sitedata, $state, $mdDialog, siteService, $mdToast) {
  var vm = this

  vm.availStates = ['ACTIVE', 'CLOSED']
  vm.cancelDialog = cancelDialog
  vm.newSite = sitedata
  vm.site = sitedata
  vm.updateSite = updateSite

  activate()

  function activate () {
    vm.newSite.isPrivate = (vm.site.visibility === 'PRIVATE')
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function updatePdSite () {
    siteService.updatePDSite(vm.newSite)
      .then(function () {
        $mdDialog.cancel()
        $state.reload()
        $mdToast.show(
          $mdToast.simple()
            .textContent('Du har opdateret: ' + vm.newSite.title)
            .hideDelay(3000)
        )
      }, function (err) {
        console.log(err)
      })
  }

  function updateSite () {
    vm.newSite.visibility = vm.newSite.isPrivate ? 'PRIVATE' : 'PUBLIC'

    if (vm.site.type === 'PD-Project') {
      updatePdSite()
      return
    }

    siteService.updateSite(vm.newSite)
      .then(function () {
        $mdDialog.cancel()
        $state.reload()
        $mdToast.show(
          $mdToast.simple()
            .textContent('Du har opdateret: ' + vm.newSite.title)
            .hideDelay(3000)
        )
      })
  }
}
