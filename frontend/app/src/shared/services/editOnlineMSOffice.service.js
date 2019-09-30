//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'
import '../services/file.service'

angular
  .module('openDeskApp')
  .factory('editOnlineMSOfficeService', ['fileService', 'BROWSER_CONFIG', 'userService', 'personService',
    '$window', '$mdToast', '$translate', editOnlineMSOfficeService])

function editOnlineMSOfficeService (fileService, BROWSER_CONFIG, userService, personService, $window, $mdToast,
  $translate) {
  var toastDelay = 5000
  var msProtocolNames = {
    'doc': 'ms-word',
    'docx': 'ms-word',
    'docm': 'ms-word',
    'dot': 'ms-word',
    'dotx': 'ms-word',
    'dotm': 'ms-word',
    'xls': 'ms-excel',
    'xlsx': 'ms-excel',
    'xlsb': 'ms-excel',
    'xlsm': 'ms-excel',
    'xlt': 'ms-excel',
    'xltx': 'ms-excel',
    'xltm': 'ms-excel',
    'ppt': 'ms-powerpoint',
    'pptx': 'ms-powerpoint',
    'pot': 'ms-powerpoint',
    'potx': 'ms-powerpoint',
    'potm': 'ms-powerpoint',
    'pptm': 'ms-powerpoint',
    'pps': 'ms-powerpoint',
    'ppsx': 'ms-powerpoint',
    'ppam': 'ms-powerpoint',
    'ppsm': 'ms-powerpoint',
    'sldx': 'ms-powerpoint',
    'sldm': 'ms-powerpoint'
  }

  var service = {
    editOnline: editOnline
  }
  return service

  function getOnlineEditUrlPathParts (doc, docMetadata) {

    alert("test");
    return {
      start: docMetadata.serverURL,
//      end: doc.webdavUrl.replace('webdav', 'aos')
      end: doc.webdavUrl.replace('webdav', 'webdav')
    }
  }

  // AOS will be used for MS Office 2013 and above
  function createOnlineEditUrlAos (doc, docMetadata) {
    var urlParts = getOnlineEditUrlPathParts(doc, docMetadata)
    var ext = fileService.getFileExtension(urlParts.end)
    var protocol = msProtocolNames[ext]
    return protocol + ':ofe%7Cu%7C' + urlParts.start + '/alfresco' + urlParts.end
  }

  /**
     * Edit Online.
     *
     * @method editOnline
     * @param doc {object} Object literal representing file to be edited
     */

  function editOnline (doc) {
    if (doc.node.isLocked) {
      var checkedOut = doc.node.aspects.indexOf('cm:checkedOut') > -1
      var lockOwner = doc.node.properties['cm:lockOwner']
      var currentUser = userService.getUser().userName
      var differentLockOwner = lockOwner.userName !== currentUser

      // If locked for editing then display error message about who locked
      if (checkedOut && differentLockOwner)
        personService.getPerson(lockOwner)
          .then(function (user) {
            $mdToast.show(
              $mdToast.simple()
                .textContent($translate.instant('EDIT_MS_OFFICE.ALREADY_LOCKED', {userName: user.userName}))
                .hideDelay(toastDelay)
            )
          })
      else
        launchOnlineEditorAos(doc, doc.metadata)
    } else {
      launchOnlineEditorAos(doc, doc.metadata)
    }
  }

  /**
     * Edit Online with AOS.
     *
     * @method launchOnlineEditorAos
     * @param doc {object} Object literal representing file to be edited
     * @param metadata {object} Object literal representing metadata of the filed to be edited
     */
  function launchOnlineEditorAos (doc, metadata) {
    // Ensure we have the doc's onlineEditUrlAos populated
    if (doc.onlineEditUrlAos === undefined)
      doc.onlineEditUrlAos = createOnlineEditUrlAos(doc, metadata)

    if (BROWSER_CONFIG.isIOS)
      launchOfficeOnIosAos(doc.onlineEditUrlAos)

    // detect if we are on a supported operating system
    if (!BROWSER_CONFIG.isWin && !BROWSER_CONFIG.isMac)
      $mdToast.show(
        $mdToast.simple()
          .textContent($translate.instant('EDIT_MS_OFFICE.AOS.NO_SUPPORTED_ENVIRONMENT'))
          .hideDelay(toastDelay)
      )
    else
      tryToLaunchOfficeByMsProtocolHandlerAos(doc.onlineEditUrlAos)
  }

  function launchOfficeOnIosAos (url) {
    var iframe = document.createElement('iframe')
    iframe.setAttribute('style', 'display: none; height: 0; width: 0;')
    document.getElementsByTagName('body')[0].appendChild(iframe)
    iframe.src = url
  }

  function tryToLaunchOfficeByMsProtocolHandlerAos (url) {
    var protocolHandlerPresent = false

    var input = document.createElement('input')
    var inputTop = document.body.scrollTop + 10
    input.setAttribute('style', 'z-index: 1000; background-color: rgba(0, 0, 0, 0); border: none; ' +
            'outline: none; position: absolute; left: 10px; top: ' + inputTop + 'px;')
    document.getElementsByTagName('body')[0].appendChild(input)
    input.focus()
    input.onblur = function () {
      protocolHandlerPresent = true
    }
    input.context = this
    location.href = url
    setTimeout(function () {
      input.onblur = null
//      input.remove()
      if (!protocolHandlerPresent)
        $mdToast.show(
          $mdToast.simple()
            .textContent($translate.instant('EDIT_MS_OFFICE.AOS.SUPPORTED_OFFICE_VERSION_REQUIRED'))
            .hideDelay(toastDelay)
        )
    }, 5000)
  }
}
