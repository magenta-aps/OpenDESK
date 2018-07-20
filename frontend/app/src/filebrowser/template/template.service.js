'use strict'

angular.module('openDeskApp.filebrowser')
  .factory('templateService', ['$rootScope', '$http', 'alfrescoNodeUtils', 'filebrowserService', templateService])

function templateService ($rootScope, $http, alfrescoNodeUtils, filebrowserService) {
  var selectedTemplate
  var selectedContentType

  var service = {
    createContent: createContent,
    getSelectedContentType: getSelectedContentType,
    getSelectedTemplate: getSelectedTemplate,
    setTemplate: setTemplate
  }

  return service

  function createContent (contentName) {
    var folderNodeRef = filebrowserService.getCurrentFolderNodeRef()

    if (selectedContentType === 'FOLDER' && selectedTemplate.nodeRef === null)
      createFolder(contentName, folderNodeRef)
    else
      createContentFromTemplate(contentName, folderNodeRef)
  }

  function createContentFromTemplate (contentName, folderNodeRef) {
    return $http.post('/alfresco/service/template', {
      PARAM_METHOD: 'createContentFromTemplate',
      PARAM_TEMPLATE_NODE_ID: selectedTemplate.nodeRef,
      PARAM_DESTINATION_NODEREF: folderNodeRef,
      PARAM_NODE_NAME: contentName
    }).then(function (response) {
      $rootScope.$broadcast('updateFilebrowser')
      return response
    })
  }

  function createFolder (contentName, folderNodeRef) {
    var props = {
      prop_cm_name: contentName,
      prop_cm_title: contentName,
      alf_destination: folderNodeRef
    }

    return $http.post('/api/type/cm:folder/formprocessor', props).then(function (response) {
      $rootScope.$broadcast('updateFilebrowser')
      return response
    })
  }

  function getSelectedTemplate () {
    return selectedTemplate
  }

  function getSelectedContentType () {
    return selectedContentType
  }

  function setTemplate (template, contentType) {
    selectedTemplate = template
    selectedContentType = contentType
  }
}
