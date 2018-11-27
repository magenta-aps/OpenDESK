(function () {
  'use strict'

  angular
    .module('openDeskApp.documents')
    .factory('documentService', ['$http', 'alfrescoNodeService', documentService])

  function documentService ($http, alfrescoNodeService) {
    var service = {
      getNode: getNode,
      getSiteNode: getSiteNode,
      getSystemNode: getSystemNode,
      getBreadCrumb: getBreadCrumb,
      getTemplateFolders: getTemplateFolders,
      getThumbnail: getThumbnail
    }

    return service

    function getNode (nodeId) {
      return $http.get(`/alfresco/s/node/${nodeId}`)
        .then(function (response) {
          return response.data
        })
    }

    function getSiteNode (siteShortName) {
      return $http.get(`/alfresco/s/node/site/${siteShortName}`)
        .then(function (response) {
          return response.data
        })
    }

    function getSystemNode (shortName) {
      return $http.get(`/alfresco/s/node/system/${shortName}`)
        .then(function (response) {
          return response.data
        })
    }

    function getTemplateFolders () {
      return $http.get(`/alfresco/s/node/templateFolders`)
        .then(function (response) {
          return response.data
        })
    }

    function getBreadCrumb (type, nodeRef, rootRef, siteShortName) {
      var nodeId = alfrescoNodeService.processNodeRef(nodeRef).id
      var rootId = alfrescoNodeService.processNodeRef(rootRef).id

      return $http.get(`/alfresco/s/node/${nodeId}/breadcrumb/${rootId}`)
        .then(function (response) {
          var breadcrumb = response.data
          var paths = []
          breadcrumb.forEach(function (part) {
            var partNodeId = alfrescoNodeService.processNodeRef(part.nodeRef).id
            var link
            // If this is the first part then link to the same page
            if (partNodeId === nodeId)
              link = ''
            else
              link = getBreadCrumbPath(type, partNodeId, siteShortName)
            paths.push({
              title: part.name,
              link: link
            })
          })
          paths.push({
            title: 'Home',
            link: getBreadCrumbPath(type, '', siteShortName)
          })
          paths.reverse()
          return paths
        })
    }

    function getBreadCrumbPath (type, nodeId, siteShortName) {
      switch (type) {
        case 'my-docs':
          return 'odDocuments.myDocs({nodeRef: "' + nodeId + '"})'
        case 'shared-docs':
          return 'odDocuments.sharedDocs({nodeRef: "' + nodeId + '"})'
        case 'site':
          return 'project.filebrowser({projekt: "' + siteShortName + '", nodeRef: "' + nodeId + '"})'
        case 'system-folders':
          return 'systemsettings.filebrowser({nodeRef: "' + nodeId + '"})'
      }
    }

    function getThumbnail (nodeId, versionId) {
      return $http.get(`/alfresco/s/node/${nodeId}/thumbnail/${versionId}`)
        .then(function (response) {
          return response
        })
    }
  }
})()
