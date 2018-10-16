'use strict'
import '../../shared/services/alfrescoNode.service'
import '../../shared/services/alfrescoDownload.service'
import '../../shared/services/document/preview/preview.service'
import '../../shared/services/editOnlineMSOffice.service'
import deleteTemplate from './delete/delete.view.html'
import genericContentDialogTemplate from '../genericDialog/genericContentDialog.view.html'
import renameTemplate from './rename/rename.view.html'
import uploadNewVersionTemplate from '../view/content/document/uploadNewVersion.tmpl.html'

angular
  .module('openDeskApp.filebrowser')
  .controller('ActionsController', ['$mdMenu', '$rootScope', '$scope', '$state', '$mdDialog', '$window',
    'alfrescoDownloadService', 'alfrescoNodeService', 'contentService', 'documentPreviewService', 'documentService',
    'editOnlineMSOfficeService', ActionsController])

function ActionsController ($mdMenu, $rootScope, $scope, $state, $mdDialog, $window, alfrescoDownloadService,
  alfrescoNodeService, contentService, documentPreviewService, documentService, editOnlineMSOfficeService) {
  var vm = this
  vm.cancelDialog = cancelDialog
  vm.copyContentDialog = copyContentDialog
  vm.deleteContentDialog = deleteContentDialog
  vm.editInLibreOffice = editInLibreOffice
  vm.editInMSOffice = editInMSOffice
  vm.editInOnlyOffice = editInOnlyOffice
  vm.moveContentDialog = moveContentDialog
  vm.renameContentDialog = renameContentDialog
  vm.uploadNewVersion = uploadNewVersion
  vm.uploadNewVersionDialog = uploadNewVersionDialog

  // TODO: Remove duplicates in document.controller
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
    var nodeId = alfrescoNodeService.processNodeRef(content.nodeRef).id
    $window.open($state.href('libreOfficeEdit', { 'nodeId': nodeId }))
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
      locals: {
        nodeId: alfrescoNodeService.processNodeRef(content.nodeRef).id
      },
      controller: ['$scope', 'nodeId', function ($scope, nodeId) {
        $scope.nodeId = nodeId
      }],
      template: '<md-dialog od-create-review node-id="nodeId"></md-dialog>',
      clickOutsideToClose: true
    })
  }

  function uploadNewVersionDialog () {
    $mdDialog.show({
      template: uploadNewVersionTemplate,
      controller: 'ActionsController',
      controllerAs: 'DAC',
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function uploadNewVersion (file) {
    vm.uploading = true
    contentService.uploadNewVersion(file, null, content.nodeRef)
      .then(function () {
        hideDialogAndReloadContent()
      })
  }
}
