angular
    .module('openDeskApp.systemsettings')
    .factory('documentTypeService', documentTypeService);

function documentTypeService($http) {
    var service = {
        getDocumentTypes: getDocumentTypes,
        getDocumentType: getDocumentType,
        saveDocumentType: saveDocumentType,
        deleteDocumentType: deleteDocumentType
    };
    return service;

    function getDocumentTypes() {
        return $http.get('/api/opendesk/document/types')
            .then(onSuccess);
    }

    function getDocumentType(nodeRefId) {
        return $http.get('/api/opendesk/document/type',
            {
                params: {
                    nodeRefId: nodeRefId
                }
            }).then(onSuccess);
    }

    function saveDocumentType(documentType) {
        return $http.post('/api/opendesk/document/type', null,
            {
                params: {
                    nodeRefId: documentType.nodeRef,
                    name: documentType.name,
                    mlDisplayNames: documentType.mlDisplayNames
                }
            }).then(onSuccess);
    }

    function deleteDocumentType(nodeRefId) {
        return $http.delete('/api/opendesk/document/type',
            {
                params: {
                    nodeRefId: nodeRefId
                }
            }).then(onSuccess);
    }

    function onSuccess(response) {
        return response.data;
    }
}