// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/services/alfrescoNode.service'

angular
  .module('openDeskApp.filebrowser')
  .factory('filebrowserService', ['$http', 'alfrescoNodeService', 'documentService', fileBrowserService])

function fileBrowserService ($http, alfrescoNodeService, documentService) {
  var currentFolderNodeRef

  var service = {
    genericContentAction: genericContentAction,
    getContentList: getContentList,
    getCurrentFolderNodeRef: getCurrentFolderNodeRef,
    getHome: getHome,
    getSharedNodes: getSharedNodes,
    getTemplates: getTemplates,
    loadFromSbsys: loadFromSbsys,
    setCurrentFolder: setCurrentFolder,
    shareNode: shareNode,
    stopSharingNode: stopSharingNode
  }

  return service

  function getCurrentFolderNodeRef () {
    return currentFolderNodeRef
  }

  function setCurrentFolder (folderNodeRef) {
    currentFolderNodeRef = folderNodeRef
  }

  function getCompanyHome () {
    return $http
      .get(`/alfresco/service/node/companyHome`)
      .then(function (response) {
        return response.data.nodeRef
      })
  }

  function getContentList (nodeId) {
    return $http
      .get(`/alfresco/service/node/${nodeId}/children`)
      .then(function (response) {
        return response.data
      })
  }

  function getHome (type, siteShortName) {
    switch (type) {
      case 'user':
        return getUserHome()
          .then(function (nodeRef) {
            return nodeRef
          })
      case 'company':
        return getCompanyHome()
          .then(function (nodeRef) {
            return nodeRef
          })
      case 'site':
        return documentService.getSiteNode(siteShortName)
          .then(
            function (node) {
              return node.nodeRef
            })
    }
  }

  function getSharedNodes () {
    return $http.get(`/alfresco/service/node/shared`)
      .then(function (response) {
        return response.data
      })
  }

  function getTemplates (type) {
    return $http
      .get(`/alfresco/service/templates/${type}`)
      .then(function (response) {
        return response.data
      })
  }

  function getUserHome () {
    return $http
      .get(`/alfresco/service/node/userHome`)
      .then(function (response) {
        return response.data.nodeRef
      })
  }

  function loadFromSbsys (destinationNodeRef) {
    return $http
      .get(
        `/alfresco/s/slingshot/doclib2/doclist/type/site/sbsysfakedata/documentLibrary`
      )
      .then(function (sbsysfakedataResponse) {
        var nodeRefs = []
        for (var i in sbsysfakedataResponse.data.items)
          nodeRefs.push(sbsysfakedataResponse.data.items[i].node.nodeRef)

        return $http
          .post(`/alfresco/service/sbsys/fakedownload`, {
            destinationNodeRef: destinationNodeRef,
            nodeRefs: nodeRefs
          })
          .then(function (response) {
            return response.data
          })
      })
  }

  function genericContentAction (
    action,
    sourceNodeRefs,
    destinationNodeRef,
    parentNodeRef
  ) {
    if (action === 'move')
      return preProcessMove(sourceNodeRefs, destinationNodeRef)
        .then(function () {
          return executeAction(
            action,
            sourceNodeRefs,
            destinationNodeRef,
            parentNodeRef
          )
            .then(function (response) {
              return response
            })
        })

    return executeAction(
      action,
      sourceNodeRefs,
      destinationNodeRef,
      parentNodeRef
    )
      .then(function (response) {
        return response
      })
  }

  function executeAction (
    action,
    sourceNodeRefs,
    destinationNodeRef,
    parentNodeRef
  ) {
    var payload = {
      nodeRefs: sourceNodeRefs,
      parentId: parentNodeRef
    }

    return $http
      .post(
        '/slingshot/doclib/action/' +
          action +
          '-to/node/' +
          alfrescoNodeService.processNodeRef(destinationNodeRef).uri,
        payload
      )
      .then(function (response) {
        return response
      })
  }

  function preProcessMove (sourceNodeRefs, destinationNodeRef) {
    var payload = {
      destinationRef: destinationNodeRef,
      nodeRefs: sourceNodeRefs
    }
    return $http.put(`/alfresco/service/node/preprocess`, payload)
      .then(function (response) {
        return response.data
      })
  }

  function shareNode (nodeRef, userName, permission) {
    var nodeId = alfrescoNodeService.processNodeRef(nodeRef).id
    return $http.post(`/alfresco/service/node/${nodeId}/share/${userName}/${permission}`)
      .then(function (response) {
        return response.data
      })
  }

  function stopSharingNode (nodeRef, userName, permission) {
    var nodeId = alfrescoNodeService.processNodeRef(nodeRef).id
    return $http.delete(`/alfresco/service/node/${nodeId}/share/${userName}/${permission}`)
      .then(function (response) {
        return response.data
      })
  }
}
