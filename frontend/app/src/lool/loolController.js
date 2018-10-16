'use strict'
import '../shared/services/nodeRefUtils.service'

angular
  .module('openDeskApp.lool')
  .controller('LoolController', ['$stateParams', 'loolService', 'nodeRefUtilsService', LoolController])

function LoolController ($stateParams, loolService, nodeRefUtilsService) {
  var vm = this

  activate()

  function activate () {
    vm.nodeId = nodeRefUtilsService.getId($stateParams.nodeRef)
    loolService.getLibreOfficeUrl($stateParams.nodeRef, 'edit')
      .then(function (response) {
        if (response) {
          vm.libreOfficeUrl = response
          vm.height = '100%'
          vm.isDisplayed = true
        } else {
          vm.isDisplayed = false
        }
      })
  }
}
