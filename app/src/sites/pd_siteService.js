'use strict';

angular.module('openDeskApp.sites').factory('pd_siteService', function ($http, $window, alfrescoNodeUtils, userService, documentService) {
    var restBaseUrl = '/alfresco/s/api/';

    return {


        createPDSiteSite: function (siteShortName) {
            return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            })
        }

    }
});
