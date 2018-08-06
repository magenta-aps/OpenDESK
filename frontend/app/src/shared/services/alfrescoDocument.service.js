'use strict'

angular
  .module('openDeskApp')
  .factory('alfrescoDocumentService', ['$http', 'alfrescoNodeService', AlfrescoDocumentService])

function AlfrescoDocumentService ($http, alfrescoNodeService) {
  var service = {
    retrieveSingleDocument: retrieveSingleDocument,
    retrieveNodeContent: retrieveNodeContent
  }

  return service

  function retrieveSingleDocument (nodeRef) {
    var params = '?view=browse&noCache=' + new Date().getTime() + '&includeThumbnails=true'
    var url = '/slingshot/doclib2/node/' + alfrescoNodeService.processNodeRef(nodeRef).uri + params
    return $http.get(url)
      .then(function (result) {
        return result.data.item
      })
  }

  function retrieveNodeContent (nodeRef) {
    var url = '/api/node/content/' + alfrescoNodeService.processNodeRef(nodeRef).uri
    return $http.get(url)
      .then(function (response) {
        return response.data
      })
  }
}
