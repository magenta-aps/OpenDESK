'use strict';

angular.module('openDeskApp.systemsettings')

    .factory('systemSettingsService', function ($http, APP_BACKEND_CONFIG) {

        var service = {
            getTemplates: getTemplates,
            loadSettings: loadSettings,
            loadPublicSettings: loadPublicSettings,
            updateSettings: updateSettings,
        };

        return service;

        function getTemplates() {
            return $http.post("/alfresco/service/sites", {
                PARAM_METHOD: "getTemplates"
            }).then(function (response) {
                return response.data;
            });
        }

        function setSettings(newSettings) {
            for(var key in newSettings) {
                APP_BACKEND_CONFIG[key] = newSettings[key];
            }
        }

        function loadSettings() {
            return $http.get("/alfresco/service/settings").then(function (response) {
                setSettings(response.data);
            });
        }

        function loadPublicSettings() {
            return $http.get("/alfresco/service/settings/public").then(function (response) {
                setSettings(response.data);
            });
        }

        function updateSettings(settings) {
            return $http.put("/alfresco/service/settings",
                {
                    "properties": {
                        "settings": settings
                    }
                });
        }
    });