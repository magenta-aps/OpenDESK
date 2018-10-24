'use strict'
import '../../services/file.service'
import '../../services/translate.service'

angular
  .module('openDeskApp')
  .factory('nodePickerService', ['$http', '$translate', 'translateService', 'alfrescoNodeService', 'fileService',
    NodePickerService])

function NodePickerService ($http, $translate, translateService, alfrescoNodeService, fileService) {
  return {
    getNodeInfo: getNodeInfo
  }

  function getNodeInfo (node) {
    var url
    if (node === undefined) {
      url = `/alfresco/s/nodepicker/root`
    } else if (node.rootName !== undefined) {
      url = `/alfresco/s/nodepicker/root/${node.rootName}`
    } else if (node.nodeRef !== undefined) {
      var nodeId = alfrescoNodeService.processNodeRef(node.nodeRef).id
      url = `/alfresco/s/nodepicker/node/${nodeId}`
    }

    if (url !== undefined)
      return callUrl(url)
        .then(function (response) {
          return response
        })
  }

  function callUrl (url) {
    return $http.get(url)
      .then(function (response) {
        var nodeInfo = response.data
        angular.forEach(nodeInfo.children, function (item) {
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
