'use strict';

angular.module('openDeskApp')
    .factory('ContentService', ContentService);

function ContentService($http, alfrescoNodeUtils, EDITOR_CONFIG) {

  var service = {
    delete: deleteContent,
    get: getContent,
    history: history,
    upload: uploadContent,
    uploadNewVersion: uploadNewVersion,
    deleteVersion: deleteVersion,
    revertToVersion: revertToVersion,
    isLoolEditable: isLoolEditable,
    isMsOfficeEditable: isMsOfficeEditable
  };
  
  return service;

  function getContent (nodeRef) {
    return $http.get(`/slingshot/doclib2/node/workspace/SpacesStore/${nodeRef}`)
    .then(function (response) {
        return response.data;
    });
}

  function deleteContent (nodeRef) {
    return $http.delete(`/slingshot/doclib/action/file/node/${alfrescoNodeUtils.processNodeRef(nodeRef).uri}`)
    .then(function (result) {
        return result.data;
    });
  }

  function deleteVersion (parent, versionNode) {
    return $http.get(`/alfresco/s/history?method=deleteVersion&parentNode=${parent}&versionNode=${versionNode}`)
    .then(function (response) {
        return response.data;
    });
  }

  function history (documentNodeRef) {
    return $http.get(`/alfresco/s/history?method=getAll&NODE_ID=${documentNodeRef}&STORE_TYPE=workspace&STORE_ID=SpacesStore`)
    .then(function (response) {
      return response.data;
    });
  }

  function uploadContent (file, destination) {
    var payload = {
      PARAM_METHOD: "returnFileName",
      PARAM_FILENAME: file.name,
      PARAM_DESTINATION: destination
    }

    return $http.post("/alfresco/service/sites", payload)
    .then(function (response) {
      var formData = new FormData();
      formData.append("filedata", file);
      formData.append("filename", response.data[0].fileName);
      formData.append("destination", destination ? destination : null);

      var headers = {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      }

      return $http.post("/api/upload", formData, headers)
      .then(function (response) {
        return response;
      });
    });
  }

  function uploadNewVersion (file, destination, existingNodeRef) {
    var formData = new FormData();
    formData.append("filedata", file);
    formData.append("updatenoderef", existingNodeRef);
    formData.append("majorversion", false);
    formData.append("filename", file.name);
    formData.append("destination", destination ? destination : null);

    var headers = {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }

    return $http.post("/api/upload", formData, headers)
    .then(function (response) {
      return response;
    });
  }

  function revertToVersion (description, majorVersion, nodeRef, version) {
    return $http.post("/api/revert", {
      description : description,
      majorVersion: majorVersion,
      nodeRef: nodeRef,
      version: version
    }).then(function (response) {
      return response;
    });
  }

  function isLoolEditable (mimeType){
    return EDITOR_CONFIG.lool.mimeTypes.indexOf(mimeType) !== -1;
  }

  function isMsOfficeEditable (mimeType){
    return EDITOR_CONFIG.msOffice.mimeTypes.indexOf(mimeType) !== -1;
  }
}
