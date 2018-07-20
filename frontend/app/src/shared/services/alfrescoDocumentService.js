'use strict'

angular
  .module('openDeskApp')
  .factory('alfrescoDocumentService', AlfrescoDocumentService)

function AlfrescoDocumentService ($http, alfrescoNodeUtils) {
  var service = {
    retrieveSingleDocument: retrieveSingleDocument,
    retrieveNodeContent: retrieveNodeContent
  }

  return service

  function retrieveSingleDocument (nodeRef) {
    var params = '?view=browse&noCache=' + new Date().getTime() + '&includeThumbnails=true'
    var url = '/slingshot/doclib2/node/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri + params
    return $http.get(url)
      .then(function (result) {
        return result.data.item
      })
  }

  function retrieveNodeContent (nodeRef) {
    var url = '/api/node/content/' + alfrescoNodeUtils.processNodeRef(nodeRef).uri
    return $http.get(url)
      .then(function (response) {
        return response.data
      })
  }
}
