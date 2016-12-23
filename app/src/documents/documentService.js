
angular
    .module('openDeskApp.documents')
    .factory('documentService', documentService);

function documentService($http) {
    var service = {
        getDocument: getDocument,
        getPath: getPath,
        getHistory: getHistory
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


}
