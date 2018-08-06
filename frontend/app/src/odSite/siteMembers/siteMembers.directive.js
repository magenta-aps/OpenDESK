'use strict'
import siteMembersTemplate from './siteMembers.view.html'

angular
  .module('openDeskApp.filebrowser')
  .directive('odSiteMembers', function () {
    return {
      restrict: 'E',
      scope: {
        groups: '=odGroups'
      },
      template: siteMembersTemplate,
      controller: 'SiteMemberController',
      controllerAs: 'vm'
    }
  })
