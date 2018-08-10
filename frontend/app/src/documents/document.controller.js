'use strict'
import '../shared/services/content.service'
import '../shared/services/document/preview/preview.service'

angular.module('openDeskApp.documents')
  .controller('DocumentController', ['$translate', 'documentService', '$stateParams', '$location',
    'documentPreviewService', 'browserService', 'UserService', 'siteService', 'headerService', 'filebrowserService',
    'ContentService', DocumentController])

function DocumentController ($translate, documentService, $stateParams, $location, documentPreviewService,
  browserService, UserService, siteService, headerService, filebrowserService, ContentService) {
  var vm = this

  vm.doc = []
  vm.plugin = []
  vm.paths = []
  activate()

  function activate () {
    vm.docHasParent = $location.search().versionId !== undefined
    vm.parentNodeId = $stateParams.doc
    vm.nodeId = vm.docHasParent ? $location.search().versionId : $stateParams.doc

    ContentService.history(vm.parentNodeId)
      .then(function (val) {
        vm.history = val
        var currentNoOfHistory = vm.history.length
        if (currentNoOfHistory > 0)
          vm.doc.firstDocumentNode = vm.history[0].nodeRef
      })

    getDocument()
    getReview()
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

  function getDocument () {
    ContentService.get(vm.parentNodeId)
      .then(function (response) {
        vm.doc = response.item
        vm.doc.hasParent = vm.docHasParent
        vm.doc.parentNodeId = vm.parentNodeId
        vm.doc.metadata = response.metadata
        vm.doc.nodeId = vm.nodeId

        if (vm.docHasParent)
          vm.doc.store = 'versionStore://version2Store/'
        else
          vm.doc.store = 'workspace://SpacesStore/'

        loadPreview()

        if (vm.doc.location.site !== undefined) {
          // Compile paths for breadcrumb directive
          vm.paths = buildSiteBreadCrumbPath(response)

          vm.site = vm.doc.location.site.name

          siteService.loadSiteData(vm.site)
            .then(function (response) {
              vm.type = response.type
              vm.title = response.title
              vm.doc.siteNodeId = response.nodeRef

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
        vm.loaded = true

        browserService.setTitle(response.item.node.properties['cm:name'])
      })
  }

  function getReview () {
    vm.reviewId = $stateParams.reviewId
  }

  function loadPreview () {
    // todo check if not ok type like pdf, jpg and png - then skip this step
    if (vm.docHasParent)
      documentService.createVersionThumbnail(vm.parentNodeId, vm.nodeId)
        .then(function (response) {
          documentPreviewService.previewDocumentPlugin(response.data[0].nodeRef)
            .then(function (plugin) {
              vm.plugin = plugin
            })
        })
    else
      documentPreviewService.previewDocumentPlugin(vm.doc.store + vm.nodeId)
        .then(function (plugin) {
          vm.plugin = plugin
        })
  }
}
