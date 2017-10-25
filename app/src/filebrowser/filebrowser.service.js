'use strict';

angular.module('openDeskApp.filebrowser')
    .factory('filebrowserService', fileBrowserService);

function fileBrowserService($http, alfrescoNodeUtils) {

    var currentFolderNodeRef;

    var service = {
        getCompanyHome: getCompanyHome,
        getContentList: getContentList,
        getCurrentFolderNodeRef: getCurrentFolderNodeRef,
        getNode: getNode,
        getTemplates: getTemplates,
        loadFromSbsys: loadFromSbsys,
        setCurrentFolder: setCurrentFolder
    };
    
    return service;

    function getCurrentFolderNodeRef() {
        return currentFolderNodeRef;
    }

    function setCurrentFolder(folderNodeRef) {
        currentFolderNodeRef = folderNodeRef;
    }

    function getCompanyHome() {
        return $http.get("/alfresco/service/filebrowser?method=getCompanyHome", {}).then(function (response) {
            return response.data[0].nodeRef;
        });
    }

    function getContentList(node) {
        return $http.get("/alfresco/service/contents?node=" + node).then(function (response) {
            return response.data;
        });
    }

    function getNode(nodeRef, path) {
        return $http.get('/slingshot/doclib/doclist/all/node/' + nodeRef + '/' + path).then(function (response) {
            return response.data;
        });
    }

    function getTemplates(type) {
        return $http.post("/alfresco/service/template", {
            PARAM_METHOD: "get" + type + "Templates"
        }).then(function (response) {
            return response.data[0];
        });
    }

    function loadFromSbsys(destinationNodeRef) {
        return $http.get("/alfresco/s/slingshot/doclib2/doclist/type/site/sbsysfakedata/documentLibrary", {}).then(function (sbsysfakedataResponse) {
            var nodeRefs = [];
            for (var i in sbsysfakedataResponse.data.items)
                nodeRefs.push(sbsysfakedataResponse.data.items[i].node.nodeRef);

            return $http.post("/alfresco/service/sbsys/fakedownload", {
                destinationNodeRef: destinationNodeRef,
                nodeRefs: nodeRefs
            }).then(function (response) {
                return response.data;
            });
        });
    }

}