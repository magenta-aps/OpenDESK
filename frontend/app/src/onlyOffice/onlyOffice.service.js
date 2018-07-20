'use strict'

angular.module('openDeskApp.onlyOffice')
  .factory('onlyOfficeService', onlyOfficeService)

function onlyOfficeService ($http, alfrescoNodeUtils, sessionService) {
  var restBaseUrl = '/alfresco/service'

  return {
    key: key,
    displayEdit: displayEdit,
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

  function displayPreview (nodeRef) {
    var nodeId = alfrescoNodeUtils.processNodeRef(nodeRef).id
    return display(nodeId, 'view').then(function (response) {
      return response
    })
  }

  function display (nodeId, mode) {
    return prepare(nodeId, mode).then(
      function (response) {
        new DocsAPI.DocEditor('placeholder', response)
        // Keep Alfresco active
        setInterval(function () {
          $http.get(restBaseUrl + '/touch')
        }, 60000)
        return true
      },
      function () {
        return false
      })
  }

  function prepare (nodeId, mode) {
    var url = restBaseUrl + '/parashift/onlyoffice/prepare?nodeRef=workspace://SpacesStore/' + nodeId
    var height = '100%'
    if (mode === 'view')
      height = '600px'
    return $http.get(url, {}).then(function (response) {
      response = response.data
      var userInfo = sessionService.getUserInfo()
      var docName = response.docTitle
      var docType = docName.substring(docName.lastIndexOf('.') + 1).trim()
        .toLowerCase()
      var docConfig = {
        url: response.onlyofficeUrl + 'OfficeWeb/',
        type: 'desktop',
        width: '100%',
        height: height,
        documentType: getDocumentType(docType),
        document: {
          title: docName,
          url: response.docUrl,
          fileType: docType,
          key: response.key,
          permissions: {
            edit: true
          }
        },
        editorConfig: {
          mode: mode,
          callbackUrl: response.callbackUrl,
          user: {
            id: userInfo.user.userName,
            firstname: userInfo.user.firstName,
            lastname: userInfo.user.lastName
          }
        }
      }
      if (response.lang !== undefined)
        docConfig.lang = response.lang
      return docConfig
    })
  }
}
