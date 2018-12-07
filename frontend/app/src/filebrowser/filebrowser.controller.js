// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/services/content.service'
import '../shared/services/file.service'
import uploadDocumentsTemplate from './view/content/document/uploadDocuments.tmpl.html'
import newSiteLinkTemplate from './siteLink/new.view.html'
import loadSbsysTemplate from './view/sbsys/loadSbsys.tmpl.html'
import uploadSbsysTemplate from './view/sbsys/uploadSbsys.tmpl.html'

angular
  .module('openDeskApp.filebrowser')
  .controller('FilebrowserController', ['$stateParams', '$scope', '$rootScope', '$mdDialog', '$timeout',
    'fileService', 'filebrowserService', 'documentService', 'alfrescoNodeService', '$translate',
    'APP_BACKEND_CONFIG', 'headerService', 'browserService', 'contentService', 'siteService',
    FilebrowserController])

function FilebrowserController ($stateParams, $scope, $rootScope, $mdDialog, $timeout, fileService,
  filebrowserService, documentService, alfrescoNodeService, $translate, APP_BACKEND_CONFIG,
  headerService, browserService, contentService, siteService) {
  var vm = this

  vm.cancelDialog = cancelDialog
  vm.cancelSbsysDialog = cancelSbsysDialog
  vm.loadCheckboxes = loadCheckboxes
  vm.loadFromSbsys = loadFromSbsys
  vm.loadSbsysDialog = loadSbsysDialog
  vm.newLinkDialog = newLinkDialog
  vm.setAllCheckboxes = setAllCheckboxes
  vm.uploadDocumentsDialog = uploadDocumentsDialog
  vm.uploadFiles = uploadFiles
  vm.uploadSbsys = uploadSbsys
  vm.uploadSbsysDialog = uploadSbsysDialog

  var folderNodeRef = ''
  vm.contentList = []
  vm.contentListLength = 0
  vm.documentTemplates = {}
  vm.enableESDH = APP_BACKEND_CONFIG.enableESDH
  vm.error = false
  vm.folderTemplates = {}
  vm.isLoading = true
  vm.paths = []
  vm.permissions = {}
  vm.sendAllToSbsys = false
  vm.sendToSbsys = false
  vm.uploading = false

  $scope.filesToFilebrowser = null
  $scope.isSite = false
  $scope.order = 'name'
  $scope.reverse = false
  $scope.showProgress = false
  $scope.uploadedToSbsys = false

  $scope.$on('updateFilebrowser', function () {
    activate()
  })

  $scope.$watch('filesToFilebrowser', function () {
    if ($scope.filesToFilebrowser !== null) {
      $scope.files = $scope.filesToFilebrowser
      vm.uploadFiles($scope.files)
    }
  })

  activate()

  function activate () {
    vm.path = $stateParams.path
    if ($stateParams.selectedTab !== undefined) {
      $scope.tab = {}
      $scope.tab.selected = $stateParams.selectedTab
    }
    var title
    if ($stateParams.type === 'site') {
      $scope.isSite = true
      $scope.$watch('siteService.getUserManagedProjects()', function (newVal) {
        $scope.userManagedProjects = newVal
      })
    } else if ($stateParams.type === 'shared-docs') {
      title = $translate.instant('DOCUMENT.SHARED_WITH_ME')
      browserService.setTitle(title)
      headerService.setTitle(title)
      loadSharedNodes()
    } else if ($stateParams.type === 'my-docs') {
      title = $translate.instant('DOCUMENT.MY_DOCUMENTS')
      browserService.setTitle(title)
      headerService.setTitle(title)
    }

    if ($stateParams.nodeRef !== undefined && $stateParams.nodeRef !== '')
      documentService.getNode($stateParams.nodeRef)
        .then(
          function (document) {
            setFolderAndPermissions(document)
          })
    else if ($stateParams.type === 'site')
      documentService.getSiteNode($stateParams.projekt)
        .then(
          function (document) {
            getSiteUserPermissions()
            setFolder(document.nodeRef)
          })
    else
      documentService.getSystemNode($stateParams.type)
        .then(
          function (document) {
            setFolderAndPermissions(document)
          })

    filebrowserService.getTemplates('document')
      .then(function (documentTemplates) {
        vm.documentTemplates = documentTemplates
      })

    filebrowserService.getTemplates('folder')
      .then(function (folderTemplates) {
        vm.folderTemplates = folderTemplates
        vm.folderTemplates.unshift({
          nodeRef: null,
          name: $translate.instant('COMMON.EMPTY') + ' ' + $translate.instant('COMMON.FOLDER'),
          isFolder: true
        })
      })
  }

  function getSiteUserPermissions () {
    vm.permissions = siteService.getPermissions()
    if (vm.permissions === undefined)
      siteService.getSiteUserPermissions($stateParams.projekt)
        .then(function (permissions) {
          vm.permissions = permissions
        })
  }

  function setFolderAndPermissions (document) {
    setFolder(document.nodeRef)
    vm.permissions.canEdit = document.canEdit
  }

  function setFolder (fNodeRef) {
    filebrowserService.setCurrentFolder(fNodeRef)
    folderNodeRef = fNodeRef
    var folder = alfrescoNodeService.processNodeRef(folderNodeRef).id
    loadContentList(folder)
  }

  function loadContentList (folderUUID) {
    filebrowserService.getContentList(folderUUID)
      .then(
        function (contentList) {
          loadNodes(contentList)
        },
        function (error) {
          console.log(error)
          vm.isLoading = false
          vm.error = true
        }
      )
  }

  function loadSharedNodes () {
    filebrowserService.getSharedNodes()
      .then(
        function (contentList) {
          loadNodes(contentList)
        },
        function (error) {
          console.log(error)
          vm.isLoading = false
          vm.error = true
        }
      )
  }

  function loadNodes (contentList) {
    vm.contentList = contentList

    angular.forEach(vm.contentList, function (contentTypeList) {
      vm.contentListLength += contentTypeList.length
    })
    // Compile paths for breadcrumb directive
    if (folderNodeRef !== '')
      buildBreadCrumbPath()

    vm.isLoading = false
  }

  function buildBreadCrumbPath () {
    var homeType
    switch ($stateParams.type) {
      case 'my-docs':
        homeType = 'user'
        break
      case 'shared-docs':
        homeType = 'company'
        break
      case 'site':
        homeType = 'site'
        break
      case 'system-folders':
        homeType = 'company'
        break
    }

    filebrowserService.getHome(homeType, $stateParams.projekt)
      .then(function (rootRef) {
        documentService.getBreadCrumb($stateParams.type, folderNodeRef, rootRef, $stateParams.projekt)
          .then(function (breadcrumb) {
            vm.paths = breadcrumb
          })
      })
  }

  // Dialogs

  function cancelDialog () {
    $mdDialog.cancel()
    $scope.files = []
  }

  function hideDialogAndReloadContent () {
    vm.uploading = false
    $rootScope.$broadcast('updateFilebrowser')
    cancelDialog()
  }

  // Documents

  function uploadDocumentsDialog (event) {
    $mdDialog.show({
      template: uploadDocumentsTemplate,
      targetEvent: event,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function uploadFiles (files) {
    vm.uploading = true

    angular.forEach(files, function (file) {
      contentService.upload(file, folderNodeRef)
        .then(function () {
          hideDialogAndReloadContent()
        })
    })

    $scope.files = []
  }

  // Link

  function newLinkDialog () {
    $mdDialog.show({
      template: newSiteLinkTemplate,
      controller: 'SiteLinkController as vm',
      clickOutsideToClose: true
    })
  }

  // SBSYS

  function loadSbsysDialog (event) {
    $mdDialog.show({
      template: loadSbsysTemplate,
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function loadFromSbsys () {
    filebrowserService.loadFromSbsys(folderNodeRef)
      .then(function () {
        hideDialogAndReloadContent()
      })
  }

  function uploadSbsysDialog (event) {
    $mdDialog.show({
      template: uploadSbsysTemplate,
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function cancelSbsysDialog () {
    $scope.showProgress = false
    $scope.uploadedToSbsys = false
    $mdDialog.cancel()
  }

  function uploadSbsys () {
    $scope.showProgress = true
    $timeout(setSbsysShowAttr, 2500)
  }

  function loadCheckboxes () {
    vm.sendAllToSbsys = true
    vm.sendToSbsys = false
    vm.contentList.forEach(function (contentTypeList) {
      contentTypeList.forEach(function (content) {
        vm.sendToSbsys = vm.sendToSbsys || content.sendToSbsys
        vm.sendAllToSbsys = vm.sendAllToSbsys && content.sendToSbsys
      })
    })
  }

  function setAllCheckboxes () {
    vm.contentList.forEach(function (contentTypeList) {
      contentTypeList.forEach(function (content) {
        content.sendToSbsys = vm.sendAllToSbsys
      })
    })
    vm.sendToSbsys = vm.sendAllToSbsys
  }

  function setSbsysShowAttr () {
    $scope.showProgress = false
    $scope.uploadedToSbsys = true
  }
}
