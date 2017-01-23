
angular
    .module('openDeskApp.documents')
    .factory('documentService', documentService);


function documentService($http) {

    var service = {
        getDocument: getDocument,
        getPath: getPath,
        getHistory: getHistory,
        UploadNewVersion: uploadNewVersion
    };

    return service;

    
    function getDocument(documentNodeRef) {
        return $http.get('/slingshot/doclib/node/workspace/SpacesStore/' + documentNodeRef, {
        }).then(function(response) {
            console.log('doc user access data');
            console.log(response.data.item.permissions.userAccess.create);
            return response.data;
        });
    }

    
    function getPath(documentNodeRef) {
        return $http.get('/slingshot/doclib/node/workspace/SpacesStore/' + documentNodeRef, {
        }).then(function(response) {
            return response.data.item.location;
        });
    }

    
    function getHistory(documentNodeRef) {

        var url = '/alfresco/s/history?method=getAll&NODE_ID=' + documentNodeRef + '&STORE_TYPE=workspace&STORE_ID=SpacesStore';

        return $http.get(url).then(function(response){
            return response.data;
        });
    }

    function createThumbnail(node, versionNode) {

        http://178.62.194.129:8080/alfresco/s/previewhelper?version_node=33ae6baa-6444-4b86-b0f2-88b8d483ae5c&parent_node=6dda80ba-9a9a-490f-9058-4fcf3da2d621

        var url = '/alfresco/s/previewHelper?version_node=' + versionNode + '&parent_node=' + node;

        return $http.get(url).then(function(response){

            console("tadaaaaa");
            console.log(response);
            return response.data;
        });
    }

    
    function uploadNewVersion (file, destination, nodeRef, major) {

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


}
