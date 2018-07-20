'use strict'

angular
  .module('openDeskApp')
  .controller('EmailTemplatesController', ['$stateParams', '$mdToast', 'alfrescoDocumentService', 'siteService',
    'ContentService', EmailTemplatesController])

function EmailTemplatesController ($stateParams, $mdToast, alfrescoDocumentService, siteService, ContentService) {
  var vm = this

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

  function save () {
    vm.uploading = true
    var file = new Blob([vm.template], { type: 'plain/text' })
    ContentService.uploadNewVersion(file, null, vm.nodeRef)
      .then(function () {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Du har gemt skabelonen.')
            .hideDelay(3000)
        )
      })
    if (vm.subject)
      saveEmailSubject()
  }

  function saveEmailSubject () {
    var props = {
      prop_cm_title: vm.subject
    }
    siteService.updateNode(vm.nodeRef, props)
  }
}
