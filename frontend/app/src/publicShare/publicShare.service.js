'use strict'

angular.module('openDeskApp.publicShare')
  .factory('publicShareService', ['$http', 'alfrescoNodeService', onlyOfficeService])

function onlyOfficeService ($http, alfrescoNodeService) {
  var restBaseUrl = '/alfresco/s/api/internal/shared/'

  return {
    getShared: getShared,
    share: share,
    stopSharing: stopSharing
  }

  function getShared (sharedId) {
    var url = restBaseUrl + 'node/' + sharedId + '/metadata'
    return $http.get(url).then(function (response) {
      var item = response.data
      item.contentUrl = '/api/internal/shared/node/' + sharedId + '/content/' + item.name
      item.thumbnailUrl = '/api/internal/shared/node/' + sharedId + '/content/thumbnails/pdf'
      return item
    })
  }

  function share (nodeRef) {
    var url = restBaseUrl + 'share/' + alfrescoNodeService.processNodeRef(nodeRef).uri
    return $http.post(url).then(function (response) {
      return response.data
    })
  }

  function stopSharing (sharedId) {
    var url = restBaseUrl + 'unshare/' + sharedId
    return $http.delete(url).then(function (response) {
      return response.data
    })
  }
}
