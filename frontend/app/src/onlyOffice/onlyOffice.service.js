// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/services/alfrescoNode.service'

angular.module('openDeskApp.onlyOffice')
  .factory('onlyOfficeService', ['$http', 'alfrescoNodeService', 'sessionService', onlyOfficeService])

function onlyOfficeService ($http, alfrescoNodeService, sessionService) {
  var restBaseUrl = '/alfresco/service'

  return {
    key: key,
    displayEdit: displayEdit,
    displayNoAuthPreview: displayNoAuthPreview,
    displayPreview: displayPreview
  }

  function getDocumentType (ext) {
    if ('.docx.doc.odt.rtf.txt.html.htm.mht.pdf.djvu.fb2.epub.xps'.indexOf(ext) !== -1) return 'text'
    if ('.xls.xlsx.ods.csv'.indexOf(ext) !== -1) return 'spreadsheet'
    if ('.pps.ppsx.ppt.pptx.odp'.indexOf(ext) !== -1) return 'presentation'
    return null
  }

  function key (k) {
    var result = k.replace(new RegExp('[^0-9-.a-zA-Z_=]', 'g'), '_') + (new Date()).getTime()
    return result.substring(result.length - Math.min(result.length, 20))
  }

  function displayEdit (nodeId) {
    return display(nodeId, 'edit').then(function (response) {
      return response
    })
  }

  function displayNoAuthPreview (sharedId) {
    return display(sharedId, 'view', true).then(function (response) {
      return response
    })
  }

  function displayPreview (nodeRef) {
    var nodeId = alfrescoNodeService.processNodeRef(nodeRef).id
    return display(nodeId, 'view').then(function (response) {
      return response
    })
  }

  function display (id, mode, noAuth) {
    return prepare(id, mode, noAuth).then(
      function (response) {
        new DocsAPI.DocEditor('placeholder', response)
        // Keep Alfresco active
        setInterval(function () {
          $http.get('alfresco')
        }, 60000)
        return true
      },
      function () {
        return false
      })
  }

  function prepare (id, mode, noAuth) {
    var url = restBaseUrl + '/parashift/onlyoffice/'
    if (noAuth) {
      url += 'prepare-noauth?sharedId=' + id
      mode = 'view'
    } else {
      url += 'prepare?nodeRef=workspace://SpacesStore/' + id
    }
    return $http.get(url, {}).then(function (response) {
      return createDocConfig(mode, response.data, noAuth)
    })
  }

  function createDocConfig (mode, object, noAuth) {
    var height = '100%'
    if (noAuth !== true && mode === 'view')
      height = '600px'
    var docName = object.docTitle
    var docExtension = docName.substring(docName.lastIndexOf('.') + 1).trim()
      .toLowerCase()
    var callBackUrl = ''
    var user = {}
    if (!noAuth) {
      callBackUrl = object.callbackUrl
      var userInfo = sessionService.getUserInfo()
      user = {
        id: userInfo.user.userName,
        firstname: userInfo.user.firstName,
        lastname: userInfo.user.lastName
      }
    }
    var docConfig = {
      url: object.onlyofficeUrl + 'OfficeWeb/',
      type: 'desktop',
      width: '100%',
      height: height,
      documentType: getDocumentType(docExtension),
      document: {
        title: docName,
        url: object.docUrl,
        fileType: docExtension,
        key: object.key,
        permissions: {
          edit: true
        }
      },
      editorConfig: {
        mode: mode,
        callbackUrl: callBackUrl,
        user: user
      }
    }
    if (object.lang !== undefined)
      docConfig.lang = object.lang
    return docConfig
  }
}
