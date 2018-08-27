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
