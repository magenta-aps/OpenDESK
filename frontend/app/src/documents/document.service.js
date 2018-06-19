'use strict';

angular.module('openDeskApp.documents')
       .factory('documentService', documentService);

function documentService($http, $translate, $mdToast, $q, alfrescoNodeUtils) {

    var service = {
        getDocument: getDocument,
        getDocumentByPath: getDocumentByPath,
        getBreadCrumb: getBreadCrumb,
        getPath: getPath,
        getEditPermission: getEditPermission,
        createVersionThumbnail: createVersionThumbnail,
        cleanupThumbnail: cleanupThumbnail,
    };

    return service;

    function getDocument(nodeRef) {
        return $http.get('/slingshot/doclib2/node/workspace/SpacesStore/' + nodeRef)
        .then(function (response) {
            return response.data;
        },
        function (error) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent($translate.instant('ERROR.ERROR') + ": " +
                        $translate.instant('DOCUMENT.ERROR.DOES_NOT_EXIST'))
                    .theme('error-toast')
                    .hideDelay(3000)
            );
            return $q.reject(error);
        }
        );
    }

    function getDocumentByPath(node) {
        return $http.get('/slingshot/doclib/doclist/all/node/workspace/SpacesStore/' + node)
        .then(function (response) {
            return response.data;
        });
    }

    function getBreadCrumb(type, nodeRef, rootRef) {
        var nodeId = alfrescoNodeUtils.processNodeRef(nodeRef).id;
        var rootId = alfrescoNodeUtils.processNodeRef(rootRef).id;
        return $http.get('/alfresco/s/node/' + nodeId + '/breadcrumb/' + rootId)
        .then(function (response) {
            var breadcrumb = response.data;
            var paths = [];
            breadcrumb.forEach(function (part) {
                var nodeId = alfrescoNodeUtils.processNodeRef(part.nodeRef).id;
                var link = getBreadCrumbPath(type, nodeId);
                paths.push({
                    title: part.name,
                    link: link
                });
            });
            paths.push({
                title: 'Home',
                link: getBreadCrumbPath(type, "")
            });
            paths.reverse();
            return paths;
        });
    }

    function getBreadCrumbPath(type, nodeId) {
        if (type === "my-docs")
            return 'odDocuments.myDocs({nodeRef: "' + nodeId + '"})';
        else if (type === "shared-docs")
            return 'odDocuments.sharedDocs({nodeRef: "' + nodeId + '"})';
    }

    function getPath(documentNodeRef) {
        return $http.get('/slingshot/doclib/node/workspace/SpacesStore/' + documentNodeRef).then(function (response) {
            return response.data.item.location;
        });
    }

    function getEditPermission(documentNodeRef) {
        var url = '/alfresco/s/permissions?method=getEditPermission&NODE_ID=' + documentNodeRef + '&STORE_TYPE=workspace&STORE_ID=SpacesStore';

        return $http.get(url).then(function (response) {
            return response.data[0].edit_permission == "ALLOWED";
        });
    }

    function createVersionThumbnail(node, versionNode) {
        var url = '/alfresco/s/previewhelper?version_node=' + versionNode + '&parent_node=' + node + "&method=createThumbnail";

        return $http.get(url).then(function (response) {
            return response;
        });
    }

    function cleanupThumbnail(node) {
        var url = '/alfresco/s/previewhelper?version_node=' + node.split("/")[3] + '&method=cleanUp';

        return $http.get(url).then(function (response) {

            return response;
        });
    }
}
