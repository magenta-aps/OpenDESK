// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp')
  .factory('translateService', ['APP_BACKEND_CONFIG', TranslateService])

function TranslateService (APP_BACKEND_CONFIG) {
  var service = {
    getSitesName: getSitesName
  }

  return service

  function getSitesName () {
    if (APP_BACKEND_CONFIG.enableSites && APP_BACKEND_CONFIG.enableProjects)
      return 'SITES.NAME'
    else if (APP_BACKEND_CONFIG.enableSites)
      return 'SITES.Project.NAME_PLURAL'
    else if (APP_BACKEND_CONFIG.enableProjects)
      return 'SITES.PD-Project.NAME_PLURAL'
  }
}
