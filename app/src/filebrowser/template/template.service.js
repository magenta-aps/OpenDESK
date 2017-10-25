'use strict';

angular.module('openDeskApp.filebrowser')
    .factory('templateService', templateService);

function templateService($rootScope, $http, alfrescoNodeUtils, filebrowserService) {

    var selectedTemplate;
    var selectedContentType;

    var service = {
        createContentFromTemplate: createContentFromTemplate,
        getSelectedContentType: getSelectedContentType,
        getSelectedTemplate: getSelectedTemplate,
        setTemplate: setTemplate
    };

    return service;

    function createContentFromTemplate(contentName) {
        var folderNodeRef = filebrowserService.getCurrentFolderNodeRef();

        switch(selectedContentType) {
            case 'DOCUMENT':
                createDocument(contentName, folderNodeRef);
                break;
            case 'FOLDER':
                createFolder(contentName, folderNodeRef);
                break;
            default:
                console.log('no matches');
        }
    }

    function createDocument(contentName, folderNodeRef) {
        return $http.post("/alfresco/service/template", {
            PARAM_METHOD: "createContentFromTemplate",
            PARAM_TEMPLATE_NODE_ID: selectedTemplate.nodeRef,
            PARAM_DESTINATION_NODEREF: folderNodeRef,
            PARAM_NODE_NAME: contentName
        }).then(function (response) {
            $rootScope.$broadcast('updateFilebrowser');
            return response;
        });
    }

    function createFolder(contentName, folderNodeRef) {
        var props = {
            prop_cm_name: contentName,
            prop_cm_title: contentName,
            alf_destination: folderNodeRef
        };

        return $http.post('/api/type/cm:folder/formprocessor', props).then(function (response) {
            $rootScope.$broadcast('updateFilebrowser');
            return response;
        });
    }

    function getSelectedTemplate() {
        return selectedTemplate;
    }

    function getSelectedContentType() {
        return selectedContentType;
    }

    function setTemplate(template, contentType) {
        selectedTemplate = template;
        selectedContentType = contentType;
    }
}