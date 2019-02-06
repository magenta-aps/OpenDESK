// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../../shared/services/filter.service'

angular
  .module('openDeskApp.filebrowser')
  .controller('SiteLinkController', ['$rootScope', '$mdDialog', 'siteService', 'filterService', SiteLinkController])

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
