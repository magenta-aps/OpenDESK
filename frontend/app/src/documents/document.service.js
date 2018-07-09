(function () {
  'use strict'

  angular
    .module('openDeskApp.documents')
    .factory('documentService', documentService)

  function documentService ($http, alfrescoNodeUtils) {
    var service = {
      getDocumentByPath: getDocumentByPath,
      getBreadCrumb: getBreadCrumb,
      getEditPermission: getEditPermission,
      createVersionThumbnail: createVersionThumbnail,
      cleanupThumbnail: cleanupThumbnail,
        isLibreOfficeEditable: isLibreOfficeEditable,
        isMsOfficeEditable: isMsOfficeEditable,
        isOnlyOfficeEditable: isOnlyOfficeEditable
    }

    return service

    function getDocumentByPath (node) {
      return $http.get(`/slingshot/doclib/doclist/all/node/workspace/SpacesStore/${node}`)
        .then(function (response) {
          return response.data
        })
    }

    function getBreadCrumb (type, nodeRef, rootRef) {
      var nodeId = alfrescoNodeUtils.processNodeRef(nodeRef).id
      var rootId = alfrescoNodeUtils.processNodeRef(rootRef).id

      return $http.get(`/alfresco/s/node/${nodeId}/breadcrumb/${rootId}`)
        .then(function (response) {
          var breadcrumb = response.data
          var paths = []
          breadcrumb.forEach(function (part) {
            var nodeId = alfrescoNodeUtils.processNodeRef(part.nodeRef).id
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

    function getEditPermission (documentNodeRef) {
      return $http.get(`/alfresco/s/permissions?method=getEditPermission&NODE_ID=${documentNodeRef}&STORE_TYPE=workspace&STORE_ID=SpacesStore`)
        .then(function (response) {
          return response.data[0].edit_permission === 'ALLOWED'
        })
    }

    function createVersionThumbnail (node, versionNode) {
      return $http.get(`/alfresco/s/previewhelper?version_node=${versionNode}&parent_node=${node}&method=createThumbnail`)
        .then(function (response) {
          return response
        })
    }

    function cleanupThumbnail (node) {
      return $http.get(`/alfresco/s/previewhelper?version_node=${node.split('/')[3]}&method=cleanUp`)
        .then(function (response) {
          return response
        })
    }


      function isLibreOfficeEditable(mimeType, isLocked){
          if(!APP_BACKEND_CONFIG.editors.libreOffice)
              return false;
          if(!isLocked)
              return EDITOR_CONFIG.lool.mimeTypes.indexOf(mimeType) !== -1;
      }

      function isMsOfficeEditable(mimeType, isLocked){
          if(!APP_BACKEND_CONFIG.editors.msOffice)
              return false;
          if(!isLocked)
              return EDITOR_CONFIG.msOffice.mimeTypes.indexOf(mimeType) !== -1;
      }

      function isOnlyOfficeEditable(mimeType, isLocked, lockType){
          if(!APP_BACKEND_CONFIG.editors.onlyOffice)
              return false;
          if(!isLocked || lockType === 'WRITE_LOCK')
              return EDITOR_CONFIG.lool.mimeTypes.indexOf(mimeType) !== -1;
      }
  }
})()
