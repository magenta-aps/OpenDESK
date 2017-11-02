'use strict';

angular.module('openDeskApp.filebrowser')
    .factory('filebrowserService', fileBrowserService);

function fileBrowserService($http) {

    var currentFolderNodeRef;

    var service = {
        genericContentAction: genericContentAction,
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
            // var data = [];
            // if(type == "Document") {
            //     angular.forEach(response.data[0], function(template) {
            //         if(!template.isFolder) {
            //             data.push(template);
            //         } else {
            //             findNestedTemplates(template.nodeRef).then(function(nested) {
            //             });
            //         }
            //     });
            // }
            // console.log(data);
            return response.data[0];
        });
    }

    //not in use
    function findNestedTemplates(templateNodeRef) {
        var templatesObj = [];

        return getContentList(templateNodeRef).then(function(content)  {
            // console.log('welcome to recursion hell');
            // console.log(content);
            var templates = content[0];
            var folders = content[1];

            templatesObj.push(templates);

            // console.log(templates);
            angular.forEach(folders, function(folder) {
                // console.log(folder);
                var template = folder;
                findNestedTemplates(folder.shortRef);
            });

            return templatesObj;
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

    function genericContentAction(action, sourceNodeRefs, destinationNodeRef, parentNodeRef) {
        return $http.post('/slingshot/doclib/action/' + action + '-to/node/' +
            alfrescoNodeUtils.processNodeRef(destinationNodeRef).uri, {
            nodeRefs: sourceNodeRefs,
            parentId: parentNodeRef
        }).then(function (response) {
            return response;
        });
    }

}