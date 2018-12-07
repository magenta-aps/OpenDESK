// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../../shared/services/alfrescoDocument.service'
import '../../shared/services/content.service'

angular
  .module('openDeskApp')
  .controller('EmailTemplatesController', ['$stateParams', '$mdToast', 'alfrescoDocumentService', 'alfrescoNodeService',
    'contentService', EmailTemplatesController])

function EmailTemplatesController ($stateParams, $mdToast, alfrescoDocumentService, alfrescoNodeService,
  contentService) {
  var vm = this

  vm.ckEditorCallback = ckEditorCallback
  vm.save = save
  vm.showLegend = false

  vm.placeholders = [
    'firstName',
    'lastName',
    'userName',
    'password',
    'login',
    'group',
    'siteName',
    'siteType',
    'senderFirstName',
    'senderLastName',
    'senderUserName'
  ]

  activate()

  function activate () {
    vm.nodeRef = 'workspace://SpacesStore/' + $stateParams.doc
    alfrescoDocumentService.retrieveNodeContent(vm.nodeRef)
      .then(function (response) {
        vm.template = response
      })
    alfrescoDocumentService.retrieveSingleDocument(vm.nodeRef)
      .then(function (response) {
        vm.subject = response.node.properties['cm:title']
      })
  }

  function ckEditorCallback (value) {
    vm.changedTemplate = value
  }

  function save () {
    vm.uploading = true
    if (vm.changedTemplate !== undefined)
      saveEmailContent()
    if (vm.subject)
      saveEmailSubject()
  }

  function saveEmailContent () {
    var file = new Blob([vm.changedTemplate], {type: 'html/text'})
    contentService.uploadNewVersion(file, null, vm.nodeRef)
      .then(function () {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Du har gemt skabelonen.')
            .hideDelay(3000)
        )
      })
  }

  function saveEmailSubject () {
    alfrescoNodeService.updateTitle(vm.nodeRef, vm.subject)
  }
}
