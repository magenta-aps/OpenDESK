angular.module('openDeskApp.documents')
       .factory('documentService', documentService);

function documentService($http, $translate, $mdToast, $q) {

    var service = {
        getDocument: getDocument,
        getPath: getPath,
        getHistory: getHistory,
        getEditPermission: getEditPermission,
        UploadNewVersion: uploadNewVersion,
        createVersionThumbnail: createVersionThumbnail,
        cleanupThumbnail: cleanupThumbnail,
        revertToVersion: revertToVersion,
        deleteVersion: deleteVersion
    };

    return service;

    function getDocument(documentNodeRef) {
        return $http.get('/slingshot/doclib2/node/workspace/SpacesStore/' + documentNodeRef, {}).then(
            function (response) {
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

    function getPath(documentNodeRef) {
        return $http.get('/slingshot/doclib/node/workspace/SpacesStore/' + documentNodeRef, {}).then(function (response) {
            return response.data.item.location;
        });
    }

    function getHistory(documentNodeRef) {

        var url = '/alfresco/s/history?method=getAll&NODE_ID=' + documentNodeRef + '&STORE_TYPE=workspace&STORE_ID=SpacesStore';

        return $http.get(url).then(function (response) {
            return response.data;
        });
    }

    function deleteVersion(parent, versionNode) {
        var url = '/alfresco/s/history?method=deleteVersion&parentNode=' + parent + "&versionNode=" + versionNode;

        return $http.get(url).then(function (response) {
            return response.data;
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
        var url = '/alfresco/s/previewhelper?version_node=' + node.split("/")[3] + '&method=cleanup';

        return $http.get(url).then(function (response) {

            return response;
        });
    }

    function uploadNewVersion(file, destination, nodeRef, major) {
        var formData = new FormData();
        formData.append("filedata", file);
        formData.append("filename", file.name);
        formData.append("updatenoderef", nodeRef);
        formData.append("majorversion", major);
        //formData.append("destination", destination ? destination : null);

        return $http.post("/api/upload", formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function (response) {
            return response;
        });
    }

    /**
     *      description : "A text field that servers as the comment for that particular version. Should at least be empty"
     *      majorVersion : true | false
     *      nodeRef : "the document nodeRef"
     *      version : "The version number of the nodeRef to revert to e.g. 1.17"
     */
    function revertToVersion(description, majorVersion, nodeRef, version) {
        return $http.post("/api/revert", {
            description : description,
            majorVersion: majorVersion,
            nodeRef: nodeRef,
            version: version
        }).then(function (response) {
            response.data.success ? console.log("Doc was successfully reverted") : console.log("Unable to revert document");
			console.log("response = " +  response);
			return response;
        });
    }

}
