'use strict'
import siteInfoTemplate from './siteInfo.view.html'

angular
  .module('openDeskApp.filebrowser')
  .directive('odSiteInfo', function () {
    return {
      restrict: 'E',
      scope: {
        groups: '=odGroups'
      },
      template: siteInfoTemplate,
      controller: 'SiteInfoController',
      controllerAs: 'vm'
    }
  })
