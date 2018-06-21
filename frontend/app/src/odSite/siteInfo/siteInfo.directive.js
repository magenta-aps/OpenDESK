'use strict'

angular
  .module('openDeskApp.filebrowser')
  .directive('odSiteInfo', function () {
    return {
      restrict: 'E',
      scope: {
        groups: '=odGroups'
      },
      templateUrl: 'app/src/odSite/siteInfo/siteInfo.view.html',
      controller: 'SiteInfoController',
      controllerAs: 'vm'
    }
  })
