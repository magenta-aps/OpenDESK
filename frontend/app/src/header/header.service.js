// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.header')
  .factory('headerService', headerService)

function headerService () {
  var currentTitle = ''

  var service = {
    setTitle: setTitle,
    getTitle: getTitle
  }

  return service

  function setTitle (title) {
    currentTitle = title
  }

  function getTitle () {
    return currentTitle
  }
}
