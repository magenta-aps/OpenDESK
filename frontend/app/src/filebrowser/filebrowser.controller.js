'use strict'
import '../shared/services/content.service'
import '../shared/services/file.service'
import uploadDocumentsTemplate from './view/content/document/uploadDocuments.tmpl.html'
import newSiteLinkTemplate from './siteLink/new.view.html'
import loadSbsysTemplate from './view/sbsys/loadSbsys.tmpl.html'
import uploadSbsysTemplate from './view/sbsys/uploadSbsys.tmpl.html'

angular
  .module('openDeskApp.filebrowser')
  .controller('FilebrowserController', ['$stateParams', '$scope', '$rootScope', '$mdDialog', '$timeout', 'siteService',
    'fileService', 'filebrowserService', 'documentService', 'alfrescoNodeService', 'memberService', '$translate',
    'APP_BACKEND_CONFIG', 'sessionService', 'headerService', 'browserService', 'contentService',
    FilebrowserController])

function FilebrowserController ($stateParams, $scope, $rootScope, $mdDialog, $timeout, siteService, fileService,
  filebrowserService, documentService, alfrescoNodeService, memberService, $translate, APP_BACKEND_CONFIG,
  sessionService, headerService, browserService, contentService) {
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
  vm.permissions = {}
  vm.sendAllToSbsys = false
  vm.sendToSbsys = false
  vm.uploading = false

  $scope.filesToFilebrowser = null
  $scope.isSite = $stateParams.isSite
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
    if ($stateParams.selectedTab !== undefined) $scope.tab.selected = $stateParams.selectedTab

    if ($scope.isSite) {
      $scope.$watch('siteService.getUserManagedProjects()', function (newVal) {
        $scope.userManagedProjects = newVal
      })
      siteService.getNode($stateParams.projekt, 'documentLibrary', vm.path)
        .then(function (val) {
          setFolder(val.parent.nodeRef)
        })

      vm.permissions = siteService.getPermissions()
      var title
      if (vm.permissions === undefined)
        siteService.getSiteUserPermissions($stateParams.projekt)
          .then(function (permissions) {
            vm.permissions = permissions
          })
    } else if ($stateParams.nodeRef !== undefined && $stateParams.nodeRef !== '') {
      setFolderAndPermissions($stateParams.nodeRef)
    } else if ($stateParams.type === 'shared-docs') {
      title = $translate.instant('DOCUMENT.SHARED_WITH_ME')
      browserService.setTitle(title)
      headerService.setTitle(title)
      loadSharedNodes()
    } else if ($stateParams.type === 'my-docs') {
      title = $translate.instant('DOCUMENT.MY_DOCUMENTS')
      browserService.setTitle(title)
      headerService.setTitle(title)
      filebrowserService.getUserHome()
        .then(function (userHomeRef) {
          var userHomeId = alfrescoNodeService.processNodeRef(userHomeRef).id
          setFolderAndPermissions(userHomeId)
        })
    } else {
      setFolderAndPermissionsByPath(vm.path)
    }

    filebrowserService.getTemplates('document')
      .then(function (documentTemplates) {
        vm.documentTemplates = documentTemplates
        if (vm.documentTemplates !== undefined) processContent(vm.documentTemplates)
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

  function setFolderAndPermissionsByPath (path) {
    filebrowserService.getCompanyHome()
      .then(function (val) {
        var companyHomeId = alfrescoNodeService.processNodeRef(val).id
        setFolderAndPermissions(companyHomeId + path)
      })
  }

  function setFolderAndPermissions (node) {
    documentService.getDocumentByPath(node)
      .then(
        function (response) {
          setFolder(response.metadata.parent.nodeRef)
          vm.permissions.canEdit = response.metadata.parent.permissions.userAccess.edit
        },
        function (error) {
          console.log(error)
          vm.isLoading = false
          vm.error = true
        }
      )
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
      processContent(contentTypeList)
    })
    // Compile paths for breadcrumb directive
    if (folderNodeRef !== '')
      buildBreadCrumbPath()

    vm.isLoading = false
  }

  function processContent (items) {
    angular.forEach(items, function (item) {
      item.thumbNailURL = fileService.getFileIconByMimetype(item.mimeType, 24)

      var isLocked = item.isLocked
      var lockType
      if (isLocked)
        lockType = item.lockType
      var mimeType = item.mimeType

      item.loolEditable = contentService.isLibreOfficeEditable(mimeType, isLocked)
      item.msOfficeEditable = contentService.isMsOfficeEditable(mimeType, isLocked)
      item.onlyOfficeEditable = contentService.isOnlyOfficeEditable(mimeType, isLocked, lockType)

      // Set link
      item.uiRef = getUiRef(item)

      // Set history
      getHistory(item.shortRef).then(function (response) {
        item.history = response
      })
    })
  }

  function getUiRef (content) {
    if (content.contentType === 'cmis:document')
      if ($stateParams.type === 'system-folders' && content.mimeType === 'text/html')
        return 'systemsettings.text_template_edit({doc: "' + content.shortRef + '"})'
      else
        return 'document({doc: "' + content.shortRef + '"})'

    if (content.contentType === 'cmis:folder')
      if ($stateParams.type === 'system-folders')
        return 'systemsettings.filebrowser({path: "' + vm.path + '/' + content.name + '"})'
      else if ($stateParams.type === 'my-docs')
        return 'odDocuments.myDocs({nodeRef: "' + content.shortRef + '"})'
      else if ($stateParams.type === 'shared-docs')
        return 'odDocuments.sharedDocs({nodeRef: "' + content.shortRef + '"})'
      else if ($scope.isSite)
        return 'project.filebrowser({projekt: "' + $stateParams.projekt +
                    '", path: "' + vm.path + '/' + content.name + '"})'

    if (content.contentType === 'cmis:link')
      return 'project({projekt: "' + content.destination_link + '"})'
  }

  function getHistory (nodeId) {
    return contentService.history(nodeId).then(function (val) {
      return val
    })
  }

  function buildBreadCrumbPath () {
    if ($stateParams.type === 'my-docs' || $stateParams.type === 'shared-docs') {
      var homeType
      switch ($stateParams.type) {
        case 'my-docs':
          homeType = 'user'
          break
        case 'shared-docs':
          homeType = 'company'
          break
      }

      filebrowserService.getHome(homeType)
        .then(function (rootRef) {
          documentService.getBreadCrumb($stateParams.type, folderNodeRef, rootRef)
            .then(function (breadcrumb) {
              vm.paths = breadcrumb
            })
        })
    } else if (vm.path !== undefined) {
      var homeLink

      if ($scope.isSite) homeLink = 'project.filebrowser({projekt: "' + $stateParams.projekt + '", path: ""})'
      else homeLink = 'systemsettings.filebrowser({path: ""})'

      var paths = [{
        title: 'Home',
        link: homeLink
      }]
      var pathLink = '/'
      createBreadCrumbs(paths, pathLink)
      vm.paths = paths
    }
  }

  function createBreadCrumbs (paths, pathLink) {
    var pathArr = vm.path.split('/')
    for (var a in pathArr)
      if (pathArr[a] !== '') {
        var link
        if ($scope.isSite)
          link = 'project.filebrowser({projekt: "' + $stateParams.projekt +
                        '", path: "' + pathLink + pathArr[a] + '"})'
        else
          link = 'systemsettings.filebrowser({path: "' + pathLink + pathArr[a] + '"})'
        paths.push({
          title: pathArr[a],
          link: link
        })
        pathLink = pathLink + pathArr[a] + '/'
      }
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
