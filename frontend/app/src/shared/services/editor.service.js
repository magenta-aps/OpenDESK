'use strict'

angular
  .module('openDeskApp')
  .factory('editorService', ['$http', EditorService])

function EditorService ($http) {
  var editors = {}
  var service = {
    getEditors: getEditors,
    loadEditors: loadEditors
  }

  return service

  function getEditors () {
    return editors
  }

  function loadEditors () {
    return $http.get('/alfresco/service/editors').then(function (response) {
      editors = response.data
    })
  }
}
