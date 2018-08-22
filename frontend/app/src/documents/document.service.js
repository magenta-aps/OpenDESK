(function () {
  'use strict'

  angular
    .module('openDeskApp.documents')
    .factory('documentService', ['$http', 'alfrescoNodeService', documentService])

  function documentService ($http, alfrescoNodeService) {
    var service = {
      getDocumentByPath: getDocumentByPath,
      getBreadCrumb: getBreadCrumb,
      createVersionThumbnail: createVersionThumbnail
    }

    return service

    function getDocumentByPath (node) {
      return $http.get(`/slingshot/doclib/doclist/all/node/workspace/SpacesStore/${node}`)
        .then(function (response) {
          return response.data
        })
    }

    function getBreadCrumb (type, nodeRef, rootRef) {
      var nodeId = alfrescoNodeService.processNodeRef(nodeRef).id
      var rootId = alfrescoNodeService.processNodeRef(rootRef).id

      return $http.get(`/alfresco/s/node/${nodeId}/breadcrumb/${rootId}`)
        .then(function (response) {
          var breadcrumb = response.data
          var paths = []
          breadcrumb.forEach(function (part) {
            var nodeId = alfrescoNodeService.processNodeRef(part.nodeRef).id
            var link = getBreadCrumbPath(type, nodeId)
            paths.push({
              title: part.name,
              link: link
            })
          })
          paths.push({
            title: 'Home',
            link: getBreadCrumbPath(type, '')
          })
          paths.reverse()
          return paths
        })
    }

    function getBreadCrumbPath (type, nodeId) {
      if (type === 'my-docs')
        return 'odDocuments.myDocs({nodeRef: "' + nodeId + '"})'
      else if (type === 'shared-docs')
        return 'odDocuments.sharedDocs({nodeRef: "' + nodeId + '"})'
    }

    function createVersionThumbnail (node, versionNode) {
      return $http.get(`/alfresco/s/previewhelper?version_node=${versionNode}&parent_node=${node}&method=createThumbnail`)
        .then(function (response) {
          return response
        })
    }
  }
})()
