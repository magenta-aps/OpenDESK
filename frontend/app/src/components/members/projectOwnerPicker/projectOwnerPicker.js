// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import projectOwnerPickerTemplate from './projectOwnerPicker.html'
import '../../../shared/services/filter.service'

angular.module('openDeskApp.members')
  .component('projectOwnerPicker', {
    template: projectOwnerPickerTemplate,
    controller: ['filterService', 'groupService', projectOwnerPicker],
    bindings: {
      selected: '=',
      type: '<'
    }
  })

function projectOwnerPicker (filterService, groupService) {
  var vm = this
  var owners = []

  vm.searchOwners = searchOwners

  activate()

  function activate () {
    groupService.getProjectOwners()
      .then(function (response) {
        owners = response
      })
  }

  function searchOwners (query) {
    return filterService.search(owners, {
      displayName: query
    })
  }
}
