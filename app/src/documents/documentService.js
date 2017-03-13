angular.module('openDeskApp.documents')
       .factory('documentService', documentService);

function documentService($http) {

    var service = {
        getDocument: getDocument,
        getPath: getPath,
        getHistory: getHistory,
        getEditPermission: getEditPermission,
        UploadNewVersion: uploadNewVersion,
        createThumbnail: createThumbnail,
        cleanupThumbnail: cleanupThumbnail,
        revertToVersion: revertToVersion
    };

    return service;

    function getDocument(documentNodeRef) {
        return $http.get('/slingshot/doclib/node/workspace/SpacesStore/' + documentNodeRef, {}).then(function (response) {
            console.log('doc user access data');
            console.log(response.data.item.permissions.userAccess.create);
            return response.data;
        });
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

    function getEditPermission(documentNodeRef) {

        var url = '/alfresco/s/permissions?method=getEditPermission&NODE_ID=' + documentNodeRef + '&STORE_TYPE=workspace&STORE_ID=SpacesStore';

        return $http.get(url).then(function (response) {
            return response.data[0].edit_permission == "ALLOWED";
        });
    }

    function createThumbnail(node, versionNode) {

        //http://178.62.194.129:8080/alfresco/s/previewhelper?version_node=33ae6baa-6444-4b86-b0f2-88b8d483ae5c&parent_node=6dda80ba-9a9a-490f-9058-4fcf3da2d621

        var url = '/alfresco/s/previewhelper?version_node=' + versionNode + '&parent_node=' + node + "&method=create";

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
