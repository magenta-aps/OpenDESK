'use strict';

angular.module('openDeskApp.sites').controller('SitesController', function (siteService, $scope) {
  siteService.getSites().then(function (sites) {
      $scope.sites = sites;
  });
    return {
        createSite : function() {

            var siteName = prompt("Please enter site name", new Date().getTime().toString());

            var siteDescription = prompt("Please enter site description", new Date().getTime().toString());

            siteService.createSite(siteName, siteDescription);
        }
    }
});