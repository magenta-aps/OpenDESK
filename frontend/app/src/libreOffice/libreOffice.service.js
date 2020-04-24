// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp.libreOffice')
  .factory('libreOfficeService', ['$http', '$location', '$sce', libreOfficeService])

function libreOfficeService ($http, $location, $sce) {
  return {
    getLibreOfficeUrl: getLibreOfficeUrl
  }

  function getLibreOfficeUrl (nodeRef, permission) {
    return getWopiUrl(nodeRef, permission).then(function (response) {
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

  function getWopiUrl (nodeRef, permission) {
    var action;
    if (permission == "readonly") {
      action = "read"
    } else if (permission == "edit") {
      action = "edit"
    } else {
      // no-op
    }
    return $http.get('/lool/token?nodeRef=' + nodeRef + '&action=' + action)
      .then(function (response) {
        return response.data
      })
  }
}
