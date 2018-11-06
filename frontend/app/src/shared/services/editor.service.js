'use strict'

angular
  .module('openDeskApp')
  .factory('editorService', ['$http', EditorService])

function EditorService ($http) {
  var editors = {}
  var service = {
    getEditor: getEditor,
    getEditors: getEditors,
    loadEditors: loadEditors
  }

  return service

  function getEditor (name) {
    return editors[name]
  }

  function getEditors () {
    return editors
  }

  function loadEditors () {
    return $http.get('/alfresco/service/editors').then(function (response) {
      editors = response.data
    })
  }
}
