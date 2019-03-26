//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp')
  .factory('editorService', ['$http', 'APP_BACKEND_CONFIG', EditorService])

function EditorService ($http, APP_BACKEND_CONFIG) {
  var editors = {}
  var service = {
    getEditor: getEditor,
    getEditors: getEditors,
    isEnabled: isEnabled,
    loadEditors: loadEditors
  }

  return service

  function getEditor (name) {
    return editors.hasOwnProperty(name) ? editors[name] : false
  }

  function getEditors () {
    return editors
  }

  function isEnabled (name) {
    var editor = getEditor(name)
    return editor ? APP_BACKEND_CONFIG.editors[name] : false
  }

  function loadEditors () {
    return $http.get('/alfresco/service/editors').then(function (response) {
      editors = response.data
    })
  }
}
