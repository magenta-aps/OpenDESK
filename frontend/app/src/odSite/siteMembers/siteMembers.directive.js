'use strict'

angular
  .module('openDeskApp.filebrowser')
  .directive('odSiteMembers', function () {
    return {
      restrict: 'E',
      scope: {
        groups: '=odGroups'
      },
      templateUrl: 'app/src/odSite/siteMembers/siteMembers.view.html',
      controller: 'SiteMemberController',
      controllerAs: 'vm'
    }
  })
