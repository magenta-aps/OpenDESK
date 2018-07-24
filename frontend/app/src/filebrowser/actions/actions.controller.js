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
    'editOnlineMSOfficeService', 'filebrowserService', 'MemberService', 'notificationsService', 'sessionService',
    'siteService', ActionsController])

function ActionsController ($mdMenu, $rootScope, $scope, $state, $mdDialog, $mdToast, $window, alfrescoDownloadService,
  alfrescoNodeService, ContentService, documentPreviewService, documentService, editOnlineMSOfficeService,
  filebrowserService, MemberService, notificationsService, sessionService, siteService) {
  var vm = this
  vm.cancelDialog = cancelDialog
  vm.copyContentDialog = copyContentDialog
  vm.deleteContentDialog = deleteContentDialog
  vm.editInLibreOffice = editInLibreOffice
  vm.editInMSOffice = editInMSOffice
  vm.editInOnlyOffice = editInOnlyOffice
  vm.getAvatarUrl = getAvatarUrl
  vm.moveContentDialog = moveContentDialog
  vm.renameContentDialog = renameContentDialog
  vm.searchPeople = searchPeople
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

  var content = $scope.content

  function cancelDialog () {
    $mdDialog.cancel()
    $scope.files = []
  }

  function copyContentDialog () {
    genericContentDialog('COPY')
  }

  function createReviewNotification (userName, comment) {
    siteService.createReviewNotification(content.nodeRef, userName, comment)
    $mdDialog.cancel()
  }

  function deleteContentDialog () {
    $mdDialog.show({
      template: deleteTemplate,
      locals: {data: $scope.content},
      controller: 'DeleteController as vm',
      clickOutsideToClose: true
    })
  }

  function downloadDocument () {
    alfrescoDownloadService.downloadFile(content.nodeRef, content.name)
  }

  function editInLibreOffice () {
    var params = {
      'nodeRef': content.nodeRef,
      'fileName': content.name
    }
    $state.go('lool', params)
  }

  function editInMSOffice () {
    var nodeId = alfrescoNodeService.processNodeRef(content.nodeRef).id
    documentService.getDocument(nodeId).then(function (response) {
      var doc = response.item
      var docMetadata = response.metadata
      editOnlineMSOfficeService.editOnline(undefined, doc, docMetadata)
    })
  }

  function editInOnlyOffice () {
    var nodeId = alfrescoNodeService.processNodeRef(content.nodeRef).id
    $window.open($state.href('onlyOfficeEdit', { 'nodeRef': nodeId }))
  }

  function genericContentDialog (action) {
    var sourceNodeRefs = []
    sourceNodeRefs.push(content.nodeRef)

    var data = {
      parentNodeRef: content.parentNodeRef,
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

  function getAvatarUrl (user) {
    return sessionService.makeAvatarUrl(user)
  }

  function hideDialogAndReloadContent () {
    vm.uploading = false
    $rootScope.$broadcast('updateFilebrowser')
    cancelDialog()
  }

  function moveContentDialog () {
    genericContentDialog('MOVE')
  }

  function previewDocument () {
    documentPreviewService.previewDocument(content.nodeRef)
  }

  function renameContentDialog () {
    $mdDialog.show({
      template: renameTemplate,
      locals: {content: $scope.content},
      controller: 'RenameController as vm',
      clickOutsideToClose: true
    })
  }

  function reviewDocumentsDialog () {
    $mdDialog.show({
      template: reviewDocumentTemplate,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function searchPeople (query) {
    if (query)
      return MemberService.search(query)
  }

  function shareDocumentDialog () {
    $mdDialog.show({
      template: shareDocumentTemplate,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function shareDocument (user, permission) {
    filebrowserService.shareNode(content.nodeRef, user.userName, permission)
      .then(
        function () {
          $mdToast.show(
            $mdToast.simple()
              .textContent('Dokumentet blev delt med ' + user.displayName + '.')
              .hideDelay(3000)
          )
          var nodeId = alfrescoNodeService.processNodeRef(content.nodeRef).id

          // Link differs depending of type
          var link
          if ($scope.content.contentType === 'cmis:document')
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
    filebrowserService.stopSharingNode(content.nodeRef, user.userName, permission)
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

  function uploadNewVersionDialog () {
    $mdDialog.show({
      template: uploadNewVersionTemplate,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function uploadNewVersion (file) {
    vm.uploading = true
    ContentService.uploadNewVersion(file, null, content.nodeRef)
      .then(function () {
        hideDialogAndReloadContent()
      })
  }
}
