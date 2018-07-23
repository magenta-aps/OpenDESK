'use strict'
import '../../services/file.service'

angular
  .module('openDeskApp')
  .factory('nodePickerService', NodePickerService)

function NodePickerService ($http, $translate, translateService, alfrescoNodeService, fileService) {
  return {
    getNodeInfo: getNodeInfo
  }

  function getNodeInfo (node) {
    var url
    if (node === undefined)
      url = getRootUrl()

    else if (node.rootName !== undefined)
      url = getRootNodeUrl(node.rootName)

    else if (node.nodeRef !== undefined)
      url = getNodeUrl(node.nodeRef)

    if (url !== undefined)
      return getResponse(url).then(function (response) {
        return response
      })
  }

  function getNodeUrl (nodeRef) {
    return '/alfresco/s/nodepicker/node/' + alfrescoNodeService.processNodeRef(nodeRef).id
  }

  function getRootUrl () {
    return '/alfresco/s/nodepicker/root'
  }

  function getRootNodeUrl (rootName) {
    return '/alfresco/s/nodepicker/root/' + rootName
  }

  function getResponse (url) {
    return $http.get(url).then(function (response) {
      var nodeInfo = response.data[0]
      angular.forEach(nodeInfo.children, function (item) {
        item.thumbNailURL = fileService.getFileIconByMimetype(item.mimeType, 24)
        translateName(item)
      })

      translateName(nodeInfo)
      return nodeInfo
    })
  }

  function translateName (node) {
    if (node.name === undefined)
      if (node.rootName !== undefined)
        switch (node.rootName) {
          case 'my-docs':
            node.name = $translate.instant('DOCUMENT.MY_DOCUMENTS')
            break
          case 'shared-docs':
            node.name = $translate.instant('DOCUMENT.SHARED_WITH_ME')
            break
          case 'sites':
            node.name = $translate.instant(translateService.getSitesName())
            break
        }
  }
}
