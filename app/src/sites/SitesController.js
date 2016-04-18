'use strict';

angular.module('openDeskApp.sites').controller('SitesController', function (siteService, $scope) {
  siteService.getSites().then(function (sites) {
      $scope.sites = sites;
  });
    return {
        createSite : function() {

        }
    }
});