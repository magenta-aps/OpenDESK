'use strict';

angular.module('openDeskApp.sites').factory('siteService', function ($http, $window) {
    var restBaseUrl = '/alfresco/s/api/';

    return {
        getSiteMembers: function (siteShortName) {
            return $http.get( '/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            })
        },
        getSites: function () {
            return $http.get( '/api/sites').then(function (response) {
                return response.data;
            })
        },
        createSite: function (siteName, siteDescription) {
            return $http.post( '/api/sites', {shortName: siteName, sitePreset : "default", title : siteName, description : siteDescription}).then(function (response) {
                return response.data;
            })
        }
    };
});