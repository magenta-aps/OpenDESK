// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import memberPickerTemplate from './memberPicker.html'

angular.module('openDeskApp.members')
  .component('memberPicker', {
    template: memberPickerTemplate,
    controller: ['personService', memberPicker],
    bindings: {
      selected: '='
    }
  })

function memberPicker (personService) {
  var vm = this

  vm.searchPerson = searchPerson

  function searchPerson (query) {
    if (query)
      return personService.searchPerson(query)
  }
}
