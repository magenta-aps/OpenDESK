'use strict';

angular.module('openDeskApp.documents').factory('restService', function ($http, $window) {
    var restBaseUrl = '/alfresco/s/api/';

    return {
        getSiteMembers: function (siteShortName) {
            return $http.get(restBaseUrl + '/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            })
        }


    };
});