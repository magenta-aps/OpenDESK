'use strict'
import '../../shared/services/alfrescoNode.service'
import '../../shared/services/alfrescoDownload.service'
import '../../shared/services/document/preview/preview.service'
import '../../shared/services/editOnlineMSOffice.service'
import deleteTemplate from './delete/delete.view.html'
import genericContentDialogTemplate from '../genericDialog/genericContentDialog.view.html'
import renameTemplate from './rename/rename.view.html'
import reviewDocumentTemplate from '../view/content/document/reviewDocument.tmpl.html'
import shareDocumentTemplate from '../view/content/document/shareDocument.tmpl.html'
import uploadNewVersionTemplate from '../view/content/document/uploadNewVersion.tmpl.html'

angular
  .module('openDeskApp.filebrowser')
  .controller('ActionsController', ['$mdMenu', '$rootScope', '$scope', '$state', '$mdDialog', '$mdToast', '$window',
    'alfrescoDownloadService', 'alfrescoNodeService', 'ContentService', 'documentPreviewService', 'documentService',
    'editOnlineMSOfficeService', 'filebrowserService', 'notificationsService', 'siteService', ActionsController])

function ActionsController ($mdMenu, $rootScope, $scope, $state, $mdDialog, $mdToast, $window, alfrescoDownloadService,
  alfrescoNodeService, ContentService, documentPreviewService, documentService, editOnlineMSOfficeService,
  filebrowserService, notificationsService, siteService) {
  var vm = this
  vm.cancelDialog = cancelDialog
  vm.copyContentDialog = copyContentDialog
  vm.deleteContentDialog = deleteContentDialog
  vm.editInLibreOffice = editInLibreOffice
  vm.editInMSOffice = editInMSOffice
  vm.editInOnlyOffice = editInOnlyOffice
  vm.moveContentDialog = moveContentDialog
  vm.renameContentDialog = renameContentDialog
  vm.shareDocument = shareDocument
  vm.shareDocumentDialog = shareDocumentDialog
  vm.stopSharingDocument = stopSharingDocument
  vm.uploadNewVersion = uploadNewVersion
  vm.uploadNewVersionDialog = uploadNewVersionDialog

  // TODO: Remove duplicates in document.controller
  vm.createReviewNotification = createReviewNotification
  vm.downloadDocument = downloadDocument
  vm.previewDocument = previewDocument
  vm.reviewDocumentsDialog = reviewDocumentsDialog

  var documentNodeRef = ''

  function cancelDialog () {
    $mdDialog.cancel()
    $scope.files = []
  }

  function copyContentDialog (sourceNodeRef, parentNodeRef) {
    genericContentDialog('COPY', sourceNodeRef, parentNodeRef)
  }

  function createReviewNotification (userName, comment) {
    siteService.createReviewNotification(documentNodeRef, userName, comment)
    $mdDialog.cancel()
  }

  function deleteContentDialog (content) {
    $mdDialog.show({
      template: deleteTemplate,
      locals: {data: content},
      controller: 'DeleteController as vm',
      clickOutsideToClose: true
    })
  }

  function downloadDocument (nodeRef, name) {
    alfrescoDownloadService.downloadFile(nodeRef, name)
  }

  function editInLibreOffice (nodeRef, fileName) {
    var params = {
      'nodeRef': nodeRef,
      'fileName': fileName
    }
    $state.go('lool', params)
  }

  function editInMSOffice (nodeRef) {
    var nodeId = alfrescoNodeService.processNodeRef(nodeRef).id
    documentService.getDocument(nodeId).then(function (response) {
      var doc = response.item
      var docMetadata = response.metadata
      editOnlineMSOfficeService.editOnline(undefined, doc, docMetadata)
    })
  }

  function editInOnlyOffice (nodeRef) {
    var nodeId = alfrescoNodeService.processNodeRef(nodeRef).id
    $window.open($state.href('onlyOfficeEdit', { 'nodeRef': nodeId }))
  }

  function genericContentDialog (action, sourceNodeRef, parentNodeRef) {
    var sourceNodeRefs = []
    sourceNodeRefs.push(sourceNodeRef)

    var data = {
      parentNodeRef: parentNodeRef,
      contentAction: action,
      sourceNodeRefs: sourceNodeRefs
    }

    $mdDialog.show({
      template: genericContentDialogTemplate,
      controller: 'GenericContentDialogController',
      controllerAs: 'vm',
      locals: {
        data: data
      },
      clickOutsideToClose: true
    })
  }

  function hideDialogAndReloadContent () {
    vm.uploading = false
    $rootScope.$broadcast('updateFilebrowser')
    cancelDialog()
  }

  function moveContentDialog (sourceNodeRef, parentNodeRef) {
    genericContentDialog('MOVE', sourceNodeRef, parentNodeRef)
  }

  function previewDocument (nodeRef) {
    documentPreviewService.previewDocument(nodeRef)
  }

  function renameContentDialog (content) {
    $mdDialog.show({
      template: renameTemplate,
      locals: {content: content},
      controller: 'RenameController as vm',
      clickOutsideToClose: true
    })
  }

  function reviewDocumentsDialog (event, nodeRef) {
    documentNodeRef = nodeRef

    $mdDialog.show({
      template: reviewDocumentTemplate,
      targetEvent: event,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function shareDocumentDialog (content) {
    documentNodeRef = content.nodeRef
    $scope.content = content

    $mdDialog.show({
      template: shareDocumentTemplate,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function shareDocument (user, permission, content) {
    filebrowserService.shareNode(documentNodeRef, user.userName, permission)
      .then(
        function () {
          $mdToast.show(
            $mdToast.simple()
              .textContent('Dokumentet blev delt med ' + user.displayName + '.')
              .hideDelay(3000)
          )
          var nodeId = alfrescoNodeService.processNodeRef(documentNodeRef).id

          // Link differs depending of type
          var link
          if (content.contentType === 'cmis:document')
            link = 'dokument/' + nodeId
          else
            link = 'dokumenter/delte/' + nodeId

          var subject = 'Nyt dokument delt'
          var message = 'En bruger har delt et dokument med dig'

          notificationsService.add(
            user.userName,
            subject,
            message,
            link,
            'new-shared-doc',
            ''
          )
        }
      )
  }

  function stopSharingDocument (user, permission) {
    filebrowserService.stopSharingNode(documentNodeRef, user.userName, permission)
      .then(
        function () {
          $mdToast.show(
            $mdToast.simple()
              .textContent('Dokumentet bliver ikke længere delt med ' + user.displayName + '.')
              .hideDelay(3000)
          )
        }
      )
  }

  function uploadNewVersionDialog (event, nodeRef) {
    documentNodeRef = nodeRef

    $mdDialog.show({
      template: uploadNewVersionTemplate,
      targetEvent: event,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function uploadNewVersion (file, folderNodeRef) {
    vm.uploading = true
    ContentService.uploadNewVersion(file, folderNodeRef, documentNodeRef)
      .then(function () {
        hideDialogAndReloadContent()
      })
  }
}
