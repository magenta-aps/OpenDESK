'use strict'

angular
  .module('openDeskApp.filebrowser')
  .controller('SiteLinkController', SiteLinkController)

function SiteLinkController ($rootScope, $mdDialog, siteService, filterService) {
  var vm = this

  vm.cancel = cancel
  vm.create = create
  vm.search = search
  vm.projects = []
  vm.destination = ''

  activated()

  function activated () {
    vm.projects = siteService.getUserManagedProjects()
  }

  function create () {
    siteService.createProjectLink(vm.destination.shortName)
      .then(function () {
        $rootScope.$broadcast('updateFilebrowser')
        cancel()
      })
  }

  function search (query) {
    return filterService.search(vm.projects, { title: query })
  }

  function cancel () {
    $mdDialog.cancel()
  }
}
