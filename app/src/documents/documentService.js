angular
    .module('openDeskApp.documents')
    .factory('documentService', documentService);

function documentService($http) {
    var service = {
        getDocument: getDocument,
        getPath: getPath,
        getWopiUrl : getWopiUrl,
        getIframeSrc : getIframeSrc
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

    function getWopiUrl(shortRef){
        var encNodeRef = encodeURIComponent("workspace://SpacesStore/"+ shortRef);
        return $http.get('/lool/token?nodeRef='+encNodeRef+'&action=edit')
            .then(function(response){
                console.log(response.data.access_token, response.data.wopi_src_url);
                return response.data;
        })
    }

    function getIframeSrc(frameSrcURL, access_token){
        $http.post(frameSrcURL,{access_token: access_token}).then(function(response){
            return response.data;
        })
    }
}
