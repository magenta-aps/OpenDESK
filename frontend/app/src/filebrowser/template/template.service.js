'use strict'
import '../../shared/services/alfrescoNode.service'

angular.module('openDeskApp.filebrowser')
  .factory('templateService', ['$rootScope', '$http', 'alfrescoNodeService', 'filebrowserService', templateService])

function templateService ($rootScope, $http, alfrescoNodeService, filebrowserService) {
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

  function createContentFromTemplate (name, destinationNodeRef) {
    var payLoad = {
      destinationNodeRef: destinationNodeRef,
      name: name
    }
    $http.post(`/alfresco/service/template/${selectedTemplate.nodeRef}`, payLoad)
      .then(function () {
        $rootScope.$broadcast('updateFilebrowser')
      })
  }

  function createFolder (contentName, folderNodeRef) {
    var props = {
      prop_cm_name: contentName,
      prop_cm_title: contentName,
      alf_destination: folderNodeRef
    }
    $http.post('/api/type/cm:folder/formprocessor', props)
      .then(function () {
        $rootScope.$broadcast('updateFilebrowser')
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
