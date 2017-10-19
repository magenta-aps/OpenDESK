'use strict';

angular.module('openDeskApp.systemsettings')

    .factory('systemSettingsService', function ($http, APP_BACKEND_CONFIG) {

        function updateSettings(newSettings) {
            for(var key in newSettings) {
                APP_BACKEND_CONFIG[key] = newSettings[key];
            }
        }

        return {
            getSiteMembers: function (siteShortName) {
                return $http.get('/api/sites/' + siteShortName + '/memberships?authorityType=USER').then(function (response) {
                    return response.data;
                });
            },

            getTemplates: function () {
                return $http.post("/alfresco/service/sites", {
                    PARAM_METHOD: "getTemplates"
                }).then(function (response) {
                    return response.data;
                });
            },

            loadSettings: function () {
                return $http.get("/alfresco/service/settings").then(function (response) {
                    updateSettings(response.data);
                });
            },

            loadPublicSettings: function () {
                return $http.get("/alfresco/service/settings/public").then(function (response) {
                    updateSettings(response.data);
                });
            },

            updateSettings: function (settings) {
                return $http.put("/alfresco/service/settings",
                    {
                        "properties": {
                            "settings": settings
                        }
                    });
            }
        };
    });