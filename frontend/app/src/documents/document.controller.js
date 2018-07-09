'use strict'

angular.module('openDeskApp.documents')
  .controller('DocumentController', DocumentController)

function DocumentController ($scope, $timeout, $translate, documentService, MemberService, $stateParams,
  $location, $state, documentPreviewService, alfrescoDownloadService, browserService, $mdDialog,
  notificationsService, UserService, siteService, headerService, $window, editOnlineMSOfficeService,
  filebrowserService, ContentService) {
  var vm = this

  vm.doc = []
  vm.plugin = []
  vm.paths = []
  vm.canEdit = false
  vm.browser = {}

  vm.showArchived = false

  vm.updatePreview = loadPreview
  vm.selectFile = selectFile
  vm.approveCommentDialog = approveCommentDialog
  vm.rejectCommentDialog = rejectCommentDialog
  vm.uploadNewVersionDialog = uploadNewVersionDialog
  vm.uploadNewVersion = uploadNewVersion
  vm.searchUsers = searchUsers
  vm.cancelDialog = cancelDialog
  vm.acceptEditVersionDialog = acceptEditVersionDialog
  vm.goBack = goBack
  vm.createWFNotification = createWFNotification
  vm.highlightVersion = highlightVersion
  vm.editInLibreOffice = editInLibreOffice
  vm.goToLOEditPage = goToLOEditPage
  vm.editInMSOffice = editInMSOffice
  vm.editInOnlyOffice = editInOnlyOffice
  vm.downloadDocument = downloadDocument
  vm.reviewDocumentsDialog = reviewDocumentsDialog
  vm.createReviewNotification = createReviewNotification
  vm.selectedDocumentNode = $stateParams.doc !== undefined ? $stateParams.doc : $stateParams.nodeRef.split('/')[3]

  var parentDocumentNode = $location.search().parent !== undefined ? $location.search().parent : selectedDocumentNode
  var docHasParent = $location.search().parent !== undefined
  var firstDocumentNode = ''

  angular.element($window)
    .bind('resize', function () {
      setPDFViewerHeight()
      // manuall $digest required as resize event
      // is outside of angular
      $scope.$digest()
    })

  activate()

  function activate () {
    if ($location.search().archived !== undefined && $location.search().archived === 'true')
      vm.showArchived = true

    ContentService.history(parentDocumentNode)
      .then(function (val) {
        $scope.history = val
        var currentNoOfHistory = $scope.history.length
        if (currentNoOfHistory > 0)
          firstDocumentNode = $scope.history[0].nodeRef
      })

    documentService.getEditPermission(parentDocumentNode)
      .then(function (val) {
        vm.canEdit = val
      })

    setPDFViewerHeight()
    loadPreview()
    getDocument()
    prepDocumentToReview()
  }

  function searchUsers (filter) {
    return MemberService.search(filter)
  }

  function cancelDialog () {
    $mdDialog.cancel()
  }

  function goBack () {
    window.history.go(-2)
  }

  function setPDFViewerHeight () {
    var height = $(window)
      .height() - 150 - $('header')
      .outerHeight()

    $scope.iframeStyle = {
      'height': height + 'px',
      'width': '100%'
    }
  }

  function selectFile (event) {
    var file = event.target.value
    var fileName = file.replace(/^C:\\fakepath\\/, '')
    document.getElementById('uploadFile').innerHTML = fileName
  }

  function approveCommentDialog (event) {
    $mdDialog.show({
      templateUrl: 'app/src/documents/view/aproveComment.tmpl.html',
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function rejectCommentDialog (event) {
    $mdDialog.show({
      templateUrl: 'app/src/documents/view/rejectComment.tmpl.html',
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  function uploadNewVersionDialog (event) {
    $mdDialog.show({
      templateUrl: 'app/src/filebrowser/view/content/document/uploadNewVersion.tmpl.html',
      targetEvent: event,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function uploadNewVersion (file) {
    ContentService.uploadNewVersion(file, vm.doc.parent.nodeRef, vm.doc.node.nodeRef)
      .then(function () {
        $mdDialog.cancel()
        $state.go('document', {
          doc: parentDocumentNode
        })
      })
  }

  // prepare to handle a preview of a document to review

  function prepDocumentToReview () {
    var paramValue = $location.search().dtype

    if (paramValue !== undefined) {
      vm.wf_from = $location.search().from
      vm.wf = paramValue === 'wf'
      vm.wfr = paramValue === 'wf-response'

      var NID = $location.search().NID
      notificationsService.getInfo(NID)
        .then(function (response) {
          vm.wf_comment = response.message
          vm.wf_subject = response.subject
        })
    }
  }

  function createWFNotification (comment, wtype) {
    var creator = UserService.get().userName
    var link = 'dokument/' + vm.selectedDocumentNode + '?dtype=wf-response' + '&from=' + creator

    var status = wtype === 'review-approved' ? 'godkendt' : 'afvist'

    var NID = $location.search().NID
    notificationsService.getInfo(NID)
      .then(function (response) {
        var project = response.project

        notificationsService.add(vm.wf_from, 'Review ' + status, comment, link, wtype, project)
          .then(function () {
            $mdDialog.cancel()
            vm.goBack()
          })
      })
  }

  function highlightVersion () {
    var elm = document.getElementById(vm.selectedDocumentNode)
    if (elm === undefined) elm = document.getElementById(firstDocumentNode)

    if (elm === null) {
      $timeout(vm.highlightVersion, 100)
    } else {
      elm.style.backgroundColor = '#e1e1e1'
      elm.style.lineHeight = '2'
    }
  }

  function getDocument () {
    ContentService.get(parentDocumentNode)
      .then(function (response) {
        vm.doc = response.item
        vm.isLocked = vm.doc.node.isLocked
        if(vm.isLocked) {
          vm.lockType = vm.doc.node.properties['cm:lockType']
          vm.lockOwner = vm.doc.node.properties['cm:lockOwner'].displayName
        }
        var mimeType = vm.doc.node.mimetype

        vm.loolEditable = ContentService.isLoolEditable(mimeType, vm.isLocked)
        vm.msOfficeEditable = ContentService.isMsOfficeEditable(mimeType, vm.isLocked)
        vm.onlyOfficeEditable = ContentService.isOnlyOfficeEditable(mimeType, vm.isLocked, vm.lockType)

        vm.docMetadata = response.metadata

        if (vm.doc.location.site !== undefined) {
          // Compile paths for breadcrumb directive
          vm.paths = buildSiteBreadCrumbPath(response)

          vm.site = vm.doc.location.site.name

          siteService.loadSiteData(vm.site)
            .then(function (response) {
              vm.type = response.type
              vm.title = response.title
              vm.siteNodeRef = response.nodeRef

              headerService.setTitle($translate.instant('SITES.' + vm.type + '.NAME') + ' : ' + vm.title)
            })
        } else {
          var folderNodeRef = vm.doc.node.nodeRef
          var location = vm.doc.location.path
          var homeType, type
          var user = UserService.get().userName
          var userHomeLocation = '/User Homes/' + user
          var pathIsUserHome = location.length === userHomeLocation.length && location === userHomeLocation
          var pathIsUnderUserHome = location.substring(0, userHomeLocation.length) === userHomeLocation

          if (pathIsUserHome || pathIsUnderUserHome) {
            homeType = 'user'
            type = 'my-docs'
          } else {
            homeType = 'company'
            type = 'shared-docs'
          }

          filebrowserService.getHome(homeType)
            .then(function (rootRef) {
              documentService.getBreadCrumb(type, folderNodeRef, rootRef)
                .then(
                  function (breadcrumb) {
                    vm.paths = breadcrumb
                  })
            })
          headerService.setTitle($translate.instant('DOCUMENT.DOCUMENT'))
        }

        browserService.setTitle(response.item.node.properties['cm:name'])
      })
  }

  function buildSiteBreadCrumbPath (response) {
    var paths = [{
      title: response.item.location.siteTitle,
      link: 'project.filebrowser({projekt: "' + response.item.location.site.name + '", path: ""})'
    }]
    var pathArr = response.item.location.path.split('/')
    var pathLink = '/'
    for (var a in pathArr)
      if (pathArr[a] !== '') {
        var link
        if (response.item.location.site === '')
          link = 'systemsettings.filebrowser({path: "' + pathLink + pathArr[a] + '"})'
        else
          link = 'project.filebrowser({projekt: "' + response.item.location.site.name +
                        '", path: "' + pathLink + pathArr[a] + '"})'

        paths.push({
          title: pathArr[a],
          link: link
        })
        pathLink = pathLink + pathArr[a] + '/'
      }

    paths.push({
      title: response.item.location.file,
      link: response.item.location.path
    })
    return paths
  }

  function loadPreview () {
    // todo check if not ok type like pdf, jpg and png - then skip this step
    if (docHasParent) {
      vm.store = 'versionStore://version2Store/'

      documentService.createVersionThumbnail(parentDocumentNode, selectedDocumentNode)
        .then(function (response) {
          documentPreviewService.previewDocumentPlugin(response.data[0].nodeRef)
            .then(function (plugin) {
              vm.plugin = plugin
              $scope.config = plugin
              $scope.viewerTemplateUrl = documentPreviewService.templatesUrl + plugin.templateUrl
              $scope.download = function () {
                // todo fix the download url to download from version/version2store
                alfrescoDownloadService.downloadFile($scope.config.nodeRef, $scope.config.fileName)
              }

              if (plugin.initScope)
                plugin.initScope($scope)
            })
        })
    } else {
      vm.store = 'workspace://SpacesStore/'
      documentPreviewService.previewDocumentPlugin(vm.store + $stateParams.doc)
        .then(function (plugin) {
          vm.plugin = plugin
          $scope.config = plugin
          $scope.restoreTitle = browserService.restoreTitle
          $scope.viewerTemplateUrl = documentPreviewService.templatesUrl + plugin.templateUrl
          $scope.download = function () {
            alfrescoDownloadService.downloadFile($scope.config.nodeRef, $scope.config.fileName)
          }

          if (plugin.initScope)
            plugin.initScope($scope)
        })
    }
  }

    function isVersion() {
        var ref = $stateParams.doc;
        var isFirstInHistory = ref === firstDocumentNode;
        return docHasParent && !isFirstInHistory;
    }

    function showEditVersionDialog(editor) {
        $scope.editor = editor;
        $mdDialog.show({
            templateUrl: 'app/src/documents/view/confirmEditVersionDialog.html',
            scope: $scope,
            preserveScope: true
        });
    }

    function acceptEditVersionDialog(editor) {
        if (editor === 'only-office') {
            var newPage = $window.open();
        }
        var selectedVersion = $location.search().version;
        documentService.revertToVersion("no comments", true, vm.doc.node.nodeRef, selectedVersion).then(
            function (response) {
                cancelDialog();
                if (editor === 'libre-office') {
                    $state.go('lool', {
                        'nodeRef': vm.doc.node.nodeRef,
                        'versionLabel': vm.doc.version,
                        'parent': response.config.data.nodeRef
                    });
                }
                else if (editor === 'ms-office') {
                    editOnlineMSOfficeService.editOnline(vm.siteNodeRef, vm.doc, vm.docMetadata);
                }
                else if (editor === 'only-office') {
                    newPage.location.href = $state.href('onlyOfficeEdit', {'nodeRef': parentDocumentNode});
                }
            });
    }

    function editInOnlyOffice() {
        if (isVersion()) {
            showEditVersionDialog('only-office');
        } else {
            $window.open($state.href('onlyOfficeEdit', {'nodeRef': vm.doc.node.nodeRef.split('/')[3] }));
        }
    }

    //Goes to the libreOffice online edit page
    function editInLibreOffice() {
        if (isVersion()) {
            showEditVersionDialog('libre-office');
        } else {
            $state.go('lool', {
                'nodeRef': vm.doc.node.nodeRef
            });
        }
    }

    function editInMSOffice() {
        if (isVersion()) {
            showEditVersionDialog('ms-office');
        } else {
            editOnlineMSOfficeService.editOnline(vm.siteNodeRef, vm.doc, vm.docMetadata);
        }
    }
    
    function downloadDocument() {
        var versionRef = vm.store + $stateParams.doc;
        alfrescoDownloadService.downloadFile(versionRef, vm.doc.location.file);
    }


  function reviewDocumentsDialog (event) {
    $mdDialog.show({
      templateUrl: 'app/src/filebrowser/view/content/document/reviewDocument.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: event,
      scope: $scope, // use parent scope in template
      preserveScope: true, // do not forget this if use parent scope
      clickOutsideToClose: true
    })
  }

  function createReviewNotification (userName, comment) {
    siteService.createReviewNotification(vm.doc.node.nodeRef, userName, comment)
    $mdDialog.cancel()
  }

  // this should be removed, do not edit dom in controller!
  angular.element(document)
    .ready(function () {
      if ($window.location.href.split('/')[4] !== 'lool')
        vm.highlightVersion()
    })
}
