
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
