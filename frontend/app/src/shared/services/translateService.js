'use strict'

angular
  .module('openDeskApp')
  .factory('translateService', TranslateService)

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
