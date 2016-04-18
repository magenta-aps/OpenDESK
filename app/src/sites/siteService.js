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
        createSite: function (siteName) {
            //return $http.post('/api/openesdh/case/' + caseId + '/status', {status: status}).then(function (response) {
            return $http.get( '/api/sites').then(function (response) {
                return response.data;
            })
        }



    };
});