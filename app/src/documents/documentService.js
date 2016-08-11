
angular
    .module('openDeskApp.documents')
    .factory('documentService', documentService);

function documentService($http) {
    var service = {
        getDocument: getDocument,
        getPath: getPath
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
}
