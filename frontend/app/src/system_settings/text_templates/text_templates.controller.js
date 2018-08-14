'use strict'
import '../../shared/services/alfrescoDocument.service'
import '../../shared/services/content.service'

angular
  .module('openDeskApp')
  .controller('EmailTemplatesController', ['$stateParams', '$mdToast', 'alfrescoDocumentService', 'siteService',
    'ContentService', EmailTemplatesController])

function EmailTemplatesController ($stateParams, $mdToast, alfrescoDocumentService, siteService, ContentService) {
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
    ContentService.uploadNewVersion(file, null, vm.nodeRef)
      .then(function () {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Du har gemt skabelonen.')
            .hideDelay(3000)
        )
      })
  }

  function saveEmailSubject () {
    var props = {
      prop_cm_title: vm.subject
    }
    siteService.updateNode(vm.nodeRef, props)
  }
}
