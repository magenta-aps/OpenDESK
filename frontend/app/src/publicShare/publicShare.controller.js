'use strict'
import '../shared/services/content.service'
import '../shared/services/document/preview/preview.service'

angular.module('openDeskApp.publicShare')
  .controller('PublicShareController', ['$stateParams', 'documentPreviewService', 'publicShareService',
    PublicShareController])

function PublicShareController ($stateParams, documentPreviewService, publicShareService) {
  var vm = this

  activate()

  function activate () {
    vm.sharedId = $stateParams.sharedId
    getDocument()
  }

  function getDocument () {
    publicShareService.getShared(vm.sharedId)
      .then(
        function (item) {
          vm.plugin = documentPreviewService.getPlugin(item)
          vm.plugin.height = '100%'
          vm.plugin.sharedId = vm.sharedId
        },
        function (error) {
          if (error.status.code === 404)
            vm.notFound = true
        })
  }
}
