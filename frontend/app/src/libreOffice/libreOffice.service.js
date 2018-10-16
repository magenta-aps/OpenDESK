angular
  .module('openDeskApp.libreOffice')
  .factory('libreOfficeService', ['$http', '$location', '$sce', libreOfficeService])

function libreOfficeService ($http, $location, $sce) {
  return {
    getLibreOfficeUrl: getLibreOfficeUrl
  }

  function getLibreOfficeUrl (nodeRef, permission) {
    return getWopiUrl(nodeRef).then(function (response) {
      var alfrescoURL = $location.protocol() + '://' + $location.host() + '/alfresco'
      var shortRef = nodeRef.substring(nodeRef.lastIndexOf('/') + 1)
      var wopiFileURL = alfrescoURL + '/s/wopi/files/' + shortRef
      var wopiSrcUrl = response.wopi_src_url + 'permission=' + permission
      var frameSrcURL = wopiSrcUrl + '&WOPISrc=' + wopiFileURL
      var url = frameSrcURL + '&access_token=' + response.access_token
      url = $sce.trustAsResourceUrl(url)
      return url
    })
  }

  function getWopiUrl (nodeRef) {
    return $http.get('/lool/token?nodeRef=' + nodeRef + '&action=edit')
      .then(function (response) {
        return response.data
      })
  }
}
