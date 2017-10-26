'use strict';

angular
.module('openDeskApp.filebrowser')
.directive('odSiteMembers', function () {
    return {
        restrict: 'E',
        scope: {
            groups: '=odGroups',
            site: '=odSite',
        },
        templateUrl: 'app/src/odSite/siteMembers/siteMembers.view.html',
        controller: 'SiteMemberController',
        controllerAs: 'vm'
    };
});