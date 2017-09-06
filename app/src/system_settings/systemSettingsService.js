'use strict';

angular.module('openDeskApp.systemsettings')

    .factory('systemSettingsService', function ($http, APP_CONFIG) {

        var restBaseUrl = '/alfresco/s/api/';

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
                    APP_CONFIG.settings = response.data;
                });
            },

            loadPublicSettings: function () {
                return $http.get("/alfresco/service/settings/public").then(function (response) {
                    APP_CONFIG.settings = response.data;
                });
            },

            updateSettings: function (settings) {
                var data = { "properties": { "settings": settings } }
                return $http.put("/alfresco/service/settings", data).then(function (response) {
                    APP_CONFIG.settings = settings;
                });
            }
        };
    });