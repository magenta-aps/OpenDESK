'use strict';

angular.module('openDeskApp.systemsettings').factory('systemSettingsService', function ($http, $window, alfrescoNodeUtils, userService, documentService, groupService) {

    var restBaseUrl = '/alfresco/s/api/';

    return {
        getSiteMembers: function (siteShortName) {
            return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                return response.data;
            });
        },

        getTemplates: function() {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD : "getTemplates"

            }).then(function(response) {
                console.log(response);

                return response.data;
            });
        },
        getDocumentTemplateSite: function() {
            return $http.post("/alfresco/service/sites", { PARAM_METHOD : "getDocumentTemplateSite"
            }).then(function(response) {
                return response.data[0];
            });
        }


    };
});
