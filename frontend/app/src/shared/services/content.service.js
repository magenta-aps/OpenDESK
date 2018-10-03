'use strict'
import '../../shared/services/alfrescoNode.service'

angular.module('openDeskApp')
  .factory('contentService', ['$http', 'alfrescoNodeService', contentService])

function contentService ($http, alfrescoNodeService) {
  var service = {
    delete: deleteContent,
    get: getContent,
    getNode: getNode,
    getVersions: getVersions,
    upload: uploadContent,
    uploadNewVersion: uploadNewVersion,
    revertToVersion: revertToVersion
  }

  return service

  function getContent (nodeId) {
    return $http.get(`/slingshot/doclib2/node/workspace/SpacesStore/${nodeId}`)
      .then(function (response) {
        return response.data
      })
  }

  function getNode (nodeId) {
    return $http.get(`/alfresco/service/node/${nodeId}`)
      .then(function (response) {
        return response.data
      })
  }

  function deleteContent (nodeRef) {
    return $http.delete(`/slingshot/doclib/action/file/node/${alfrescoNodeService.processNodeRef(nodeRef).uri}`)
      .then(function (result) {
        return result.data
      })
  }

  function getVersions (nodeId) {
    return $http.get(`/alfresco/service/node/${nodeId}/versions`)
      .then(function (response) {
        return response.data
      })
  }

  function uploadContent (file, destination) {
    var nodeId = alfrescoNodeService.processNodeRef(destination).id
    return $http.get(`/alfresco/service/node/${nodeId}/next-available-name?name=${file.name}`)
      .then(function (response) {
        var formData = new FormData()
        formData.append('filedata', file)
        formData.append('filename', response.data.fileName)
        formData.append('destination', destination || null)

        var headers = {
          transformRequest: angular.identity,
          headers: { 'Content-Type': undefined }
        }

        return $http.post('/api/upload', formData, headers)
          .then(function (response) {
            return response
          })
      })
  }

  function uploadNewVersion (file, destination, existingNodeRef) {
    var formData = new FormData()
    formData.append('filedata', file)
    formData.append('updatenoderef', existingNodeRef)
    formData.append('majorversion', false)
    formData.append('filename', file.name)
    formData.append('destination', destination || null)

    var headers = {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }

    return $http.post('/api/upload', formData, headers)
      .then(function (response) {
        return response
      })
  }

  function revertToVersion (description, majorVersion, nodeRef, version) {
    return $http.post('/api/revert', {
      description: description,
      majorVersion: majorVersion,
      nodeRef: nodeRef,
      version: version
    }).then(function (response) {
      return response
    })
  }
}
