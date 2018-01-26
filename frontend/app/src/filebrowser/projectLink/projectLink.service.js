'use strict';

angular.module('openDeskApp.filebrowser')
    .factory('projectLinkService', projectLinkService);

function projectLinkService($http) {

    var service = {
        createProjectLink: createProjectLink,
        deleteProjectLink: deleteProjectLink
    };

    return service;

    function createProjectLink(source,destination) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "addLink",
            PARAM_SOURCE: source,
            PARAM_DESTINATION: destination
        }).then(function (response) {
            return response.data;
        });
    }
    
    function deleteProjectLink(source, destination) {
        return $http.post("/alfresco/service/sites", {
            PARAM_METHOD: "deleteLink",
            PARAM_SOURCE: source,
            PARAM_DESTINATION: destination
        }).then(function (response) {
            return response.data;
        });
    }
}