// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../shared/services/content.service'
import '../shared/services/document/preview/preview.service'

angular.module('openDeskApp.documents')
  .controller('DocumentController', ['$translate', 'documentService', '$stateParams', '$location',
    'documentPreviewService', 'browserService', 'userService', 'siteService', 'headerService', 'filebrowserService',
    'contentService', DocumentController])

function DocumentController ($translate, documentService, $stateParams, $location, documentPreviewService,
  browserService, userService, siteService, headerService, filebrowserService, contentService) {
  var vm = this

  vm.doc = []
  vm.plugin = []
  vm.paths = []
  activate()

  function activate () {
    vm.docHasParent = $location.search().versionId !== undefined
    vm.parentNodeId = $stateParams.doc
    vm.nodeId = vm.docHasParent ? $location.search().versionId : $stateParams.doc
    getDocument()
    getReview()
  }

  function getDocument () {
    contentService.get(vm.parentNodeId)
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
        var folderNodeRef = vm.doc.node.nodeRef
        var location = vm.doc.location.path
        var user = userService.getUser().userName
        var userHomesLocation = '/User Homes'
        var userHomeLocation = userHomesLocation + '/' + user
        var pathIsUserHome = location.length === userHomeLocation.length && location === userHomeLocation
        var pathIsUnderUserHome = location.substring(0, userHomeLocation.length) === userHomeLocation
        var pathIsUnderUserHomes = location.substring(0, userHomesLocation.length) === userHomesLocation

        var siteShortName
        var homeType
        var type
        if (vm.doc.location.site !== undefined) {
          siteShortName = vm.doc.location.site.name
          homeType = 'site'
          type = 'site'
        } else if (pathIsUserHome || pathIsUnderUserHome) {
          homeType = 'user'
          type = 'my-docs'
        } else if (pathIsUnderUserHomes) {
          homeType = 'company'
          type = 'shared-docs'
        } else {
          homeType = 'company'
          type = 'system-folders'
        }

        filebrowserService.getHome(homeType, siteShortName)
          .then(function (rootRef) {
            documentService.getBreadCrumb(type, folderNodeRef, rootRef, siteShortName)
              .then(function (breadcrumb) {
                vm.paths = breadcrumb
              })
          })

        var docName = response.item.node.properties['cm:name']
        headerService.setTitle($translate.instant('DOCUMENT.DOCUMENT') + ': ' + docName)

        contentService.getNode(vm.parentNodeId)
          .then(function (node) {
            vm.doc.extraInfo = node
            var currentNoOfHistory = vm.doc.extraInfo.versions.length
            if (currentNoOfHistory > 0)
              vm.doc.firstDocumentNode = vm.doc.extraInfo.versions[0].nodeRef
            vm.loaded = true
          })

        browserService.setTitle(docName)
      })
  }

  function getReview () {
    vm.reviewId = $stateParams.reviewId
  }

  function loadPreview () {
  console.log("hvad er response");

  console.log(vm.docHasParent);
    if (vm.docHasParent)
      documentService.getThumbnail(vm.parentNodeId, vm.nodeId)
        .then(function (response) {

        console.log(response);

          documentPreviewService.getPluginByNodeRef(response.data.nodeRef)
            .then(function (plugin) {
              vm.plugin = plugin
            })
        })
    else
      documentPreviewService.getPluginByNodeRef(vm.doc.store + vm.nodeId)
        .then(function (plugin) {
          vm.plugin = plugin
        })
  }
}
