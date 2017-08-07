'use strict';

angular.module('openDeskApp.filebrowser').factory('filebrowserService', function ($http, $rootScope, alfrescoNodeUtils) {

    var restBaseUrl = '/alfresco/s/api/';

    return {

        getContentList: function (node) {
            return $http.get("/alfresco/service/contents?node=" + node).then(function (response) {
                return response.data;
            });
        },

        genericContentAction: function (action, sourceNodeRefs, destinationNodeRef, parentNodeRef) {
            return $http.post('/slingshot/doclib/action/' + action + '-to/node/' +
                alfrescoNodeUtils.processNodeRef(destinationNodeRef).uri, {
                nodeRefs: sourceNodeRefs,
                parentId: parentNodeRef
            }).then(function (response) {
                return response;
            });
        },

        getCompanyHome: function() {
            return $http.get("/alfresco/service/filebrowser?method=getCompanyHome", {}).then(function(response) {
                return response.data[0].nodeRef;
            });
        },

        getNode: function (nodeRef, path) {
            return $http.get('/slingshot/doclib2/doclist/all/node/' + nodeRef + '/' + path).then(function (response) {
                return response.data;
            });
        },

        getTemplates : function(type) {
            return $http.post("/alfresco/service/template", {
                    PARAM_METHOD: "get" + type + "Templates"
                }
            ).then(function(response) {
                return response.data[0];
            });
        },

        loadFromSbsys: function () {
            return $http.get("/alfresco/s/slingshot/doclib2/doclist/type/site/sbsysfakedata/documentLibrary", {}).then(function (sbsysfakedataResponse) {
                var nodeRefs = [];
                for (var i in sbsysfakedataResponse.data.items)
                    nodeRefs.push(sbsysfakedataResponse.data.items[i].node.nodeRef);

                return $http.get("/alfresco/s/slingshot/doclib/container/SBSYS-funktionalitet/documentLibrary", {}).then(function (sbsysfunktionalitetResponse) {

                    var destinationNodeRef = sbsysfunktionalitetResponse.data.container.nodeRef;
                    return $http.post("/alfresco/service/sbsys/fakedownload", {
                        destinationNodeRef: destinationNodeRef,
                        nodeRefs: nodeRefs
                    }).then(function (response) {
                        return response.data;
                    });
                });
            });
        },

        createContentFromTemplate: function (nodeid, currentFolderNodeRef, newName) {
            return $http.post("/alfresco/service/template", {
                PARAM_METHOD: "createContentFromTemplate",
                PARAM_TEMPLATE_NODE_ID: nodeid,
                PARAM_DESTINATION_NODEREF: currentFolderNodeRef,
                PARAM_NODE_NAME: newName
            }).then(function (response) {
                return response;
            });
        },

    };
});
