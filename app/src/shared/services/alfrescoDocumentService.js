angular
    .module('openDeskApp')
    .factory('alfrescoDocumentService', AlfrescoDocumentService);

function AlfrescoDocumentService($http, alfrescoNodeUtils) {

    var service = {
        retrieveSingleDocument: retrieveSingleDocument,
        retrieveNodeInfo: retrieveNodeInfo
    };
    return service;

    function retrieveSingleDocument(nodeRef) {
        console.log("nodeRef");
        console.log(nodeRef);

        var params = "?view=browse&noCache=" + new Date().getTime() + "&includeThumbnails=true";
        var url = "/slingshot/doclib2/node/" + alfrescoNodeUtils.processNodeRef(nodeRef).uri + params;
        return $http.get(url).then(function (result) {
            return result.data.item;
        });
    }

    function retrieveNodeInfo(nodeRef) {
        var url = '/alfresco/s/filebrowser?method=getAll&NODE_ID=' + alfrescoNodeUtils.processNodeRef(nodeRef).id + '&STORE_TYPE=workspace&STORE_ID=SpacesStore';
        return $http.get(url).then(function (response) {
            return response.data;
        });
    }

}