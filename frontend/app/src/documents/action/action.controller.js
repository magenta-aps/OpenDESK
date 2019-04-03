//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

import '../../shared/services/editOnlineMSOffice.service'
import confirmEditVersionDialogTemplate from '../view/confirmEditVersionDialog.html'
import shareDocumentTemplate from '../view/shareDocument.tmpl.html'
import uploadNewVersionTemplate from '../../filebrowser/view/content/document/uploadNewVersion.tmpl.html'

angular.module('openDeskApp.documents')
  .controller('DocumentActionController', ['$injector', '$mdDialog', '$mdToast', '$location', '$scope', '$state',
    '$stateParams', '$window', 'APP_BACKEND_CONFIG', 'alfrescoDownloadService', 'contentService',
    'documentActionService', 'editOnlineMSOfficeService', 'filebrowserService', 'personService', 'publicShareService',
    DocumentActionController])

function DocumentActionController ($injector, $mdDialog, $mdToast, $location, $scope, $state, $stateParams, $window,
  APP_BACKEND_CONFIG, alfrescoDownloadService, contentService, documentActionService, editOnlineMSOfficeService,
  filebrowserService, personService, publicShareService) {
  var vm = this
  vm.uploading = false
  vm.acceptEditVersionDialog = acceptEditVersionDialog
  vm.cancelDialog = cancelDialog
  vm.downloadDocument = downloadDocument
  vm.editInLibreOffice = editInLibreOffice
  vm.editInMSOffice = editInMSOffice
  vm.editInOnlyOffice = editInOnlyOffice
  vm.executeAction = executeAction
  vm.isEditorVisible = isEditorVisible
  vm.onPublicSharedUrlClick = onPublicSharedUrlClick
  vm.reviewDocumentsDialog = reviewDocumentsDialog
  vm.searchPeople = searchPeople
  vm.shareDocument = shareDocument
  vm.shareDocumentDialog = shareDocumentDialog
  vm.sharePublic = sharePublic
  vm.stopSharingDocument = stopSharingDocument
  vm.stopSharingPublic = stopSharingPublic
  vm.updatePreview = updatePreview
  vm.uploadNewVersionDialog = uploadNewVersionDialog
  vm.uploadNewVersion = uploadNewVersion

  vm.$onInit = function () {
    activate()
  }

  function activate () {
    vm.actions = documentActionService.getActions()
    vm.isLocked = vm.doc.node.isLocked
    if (vm.isLocked)
      vm.lockType = vm.doc.node.properties['cm:lockType']

    vm.isPublicShared = vm.doc.node.properties['qshare:sharedId']
    if (vm.isPublicShared) {
      vm.sharedId = vm.doc.node.properties['qshare:sharedId']
      setPublicSharedUrl()
    }
  }

  function executeAction (actionItem) {
    var service = $injector.get(actionItem.serviceName)
    service.executeAction(vm.doc.nodeId, this)
  }

  function acceptEditVersionDialog (editor) {
    if (editor === 'only-office' || editor === 'libre-office')
      var newPage = $window.open()

    var selectedVersion = $location.search().version
    contentService.revertToVersion('no comments', true, vm.doc.node.nodeRef, selectedVersion).then(
      function () {
        if (editor === 'libre-office')
          newPage.location.href = $state.href('libreOfficeEdit', {'nodeId': vm.doc.parentNodeId})

        else if (editor === 'ms-office')
          editOnlineMSOfficeService.editOnline(vm.doc)

        else if (editor === 'only-office')
          newPage.location.href = $state.href('onlyOfficeEdit', {'nodeRef': vm.doc.parentNodeId})

        cancelDialog()
      })
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function downloadDocument () {
    var versionRef = vm.doc.store + vm.doc.nodeId
    alfrescoDownloadService.downloadFile(versionRef, vm.doc.location.file)
  }

  function editInOnlyOffice () {
    if (isVersion())
      showEditVersionDialog('only-office')
    else
      $window.open($state.href('onlyOfficeEdit', { 'nodeRef': vm.doc.node.nodeRef.split('/')[3] }))
  }

  // Goes to the libreOffice online edit page
  function editInLibreOffice () {
    if (isVersion())
      showEditVersionDialog('libre-office')
    else
      $window.open($state.href('libreOfficeEdit', { 'nodeId': vm.doc.node.nodeRef.split('/')[3] }))
  }

  function editInMSOffice () {
    if (isVersion())
      showEditVersionDialog('ms-office')
    else
      editOnlineMSOfficeService.editOnline(vm.doc)
  }

  function isEditorVisible (editor) {
    // If the editor is enabled
    if (APP_BACKEND_CONFIG.editors[editor])
      // Then return whether the editor is installed and supports the mime type or not and that there are no locks
      // preventing editing
      return vm.doc.extraInfo.editors[editor]
    // Otherwise return false
    return false
  }

  function isVersion () {
    var ref = vm.doc.nodeId
    var isFirstInHistory = ref === vm.doc.firstDocumentNode
    return vm.doc.hasParent && !isFirstInHistory
  }

  function reviewDocumentsDialog () {
    $mdDialog.show({
      template: '<md-dialog od-create-review node-id="DAC.doc.parentNodeId"></md-dialog>',
      scope: $scope,
      preserveScope: true
    })
  }

  function searchPeople (query) {
    if (query)
      return personService.searchPerson(query)
  }

  function shareDocument (user, permission) {
    filebrowserService.shareNode(vm.doc.node.nodeRef, user.userName, permission)
      .then(function () {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Dokumentet blev delt med ' + user.displayName + '.')
            .hideDelay(3000)
        )
      })
  }

  function shareDocumentDialog () {
    $mdDialog.show({
      template: shareDocumentTemplate,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function sharePublic () {
    publicShareService.share(vm.doc.node.nodeRef)
      .then(function (response) {
        vm.sharedId = response.sharedId
        setPublicSharedUrl()
      })
  }

  function stopSharingDocument (user, permission) {
    filebrowserService.stopSharingNode(vm.doc.node.nodeRef, user.userName, permission)
      .then(function () {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Dokumentet bliver ikke længere delt med ' + user.displayName + '.')
            .hideDelay(3000)
        )
      })
  }

  function stopSharingPublic () {
    publicShareService.stopSharing(vm.sharedId)
      .then(function () {
        vm.sharedId = undefined
      })
  }

  function showEditVersionDialog (editor) {
    $scope.editor = editor
    $mdDialog.show({
      template: confirmEditVersionDialogTemplate,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function setPublicSharedUrl () {
    var href = $state.href('publicSharedDocument',
      {
        'sharedId': vm.sharedId
      })
    var host = $location.host()
    var port = host === 'localhost' ? ':' + $location.port() : ''
    var domain = $location.protocol() + '://' + host + port
    vm.publicSharedUrl = domain + href
  }

  function onPublicSharedUrlClick ($event) {
    $event.target.select()
  };

  function updatePreview () {
    $state.reload()
  }

  function uploadNewVersionDialog () {
    $mdDialog.show({
      template: uploadNewVersionTemplate,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function uploadNewVersion (file) {
    vm.uploading = true
    contentService.uploadNewVersion(file, vm.doc.parent.nodeRef, vm.doc.node.nodeRef)
      .then(function () {
        vm.uploading = false
        $mdDialog.cancel()
        updatePreview()
      })
  }
}
