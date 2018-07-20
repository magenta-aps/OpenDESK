'use strict'
angular
  .module('openDeskApp.lool')
  .controller('LoolController', LoolController)

/**
 * Main Controller for the LibreOffice online module module
 */
function LoolController ($state, $stateParams, loolService, ContentService, $mdToast, $translate, nodeRefUtilsService,
  headerService) {
  var vm = this

  if ($stateParams.nodeRef === null) {
    $mdToast.show(
      $mdToast.simple()
        .textContent($translate.instant('ERROR.ERROR') + ': ' +
                    $translate.instant('DOCUMENT.ERROR.MISSING_NODEREF'))
        .theme('error-toast')
        .hideDelay(3000)
    )
  } else {
    vm.isDisplayed = true
    vm.nodeRef = $stateParams.nodeRef
    vm.nodeId = nodeRefUtilsService.getId($stateParams.nodeRef)
    ContentService.get(vm.nodeId).then(function (document) {
      vm.doc = document.item
      loolService.getLoolServiceUrl().then(function (response) {
        if (response.charAt(response.length - 1) === '/')
          response = response.substring(0, response.length - 1)
        renderIframe(response)
      })

      headerService.setTitle('Dokument: ' + vm.doc.location.file)
    })
  }

  vm.goBack = function () {
    var parentNodeId = $stateParams.nodeRef.split('/')[3]

    if ($stateParams.versionLabel != null && $stateParams.parent != null) {
      var sp = $stateParams.versionLabel.split('.')
      var bump = (parseInt(sp[1]) + 1)
      var newVersion = sp[0] + '.' + bump

      ContentService.deleteVersion($stateParams.parent, newVersion)
        .then(function () {
          $state.go('document', { 'doc': parentNodeId })
        })
    } else {
      $state.go('document', { 'doc': parentNodeId })
    }
  }

  function renderIframe (serviceUrl) {
    loolService.getWopiUrl(vm.nodeRef).then(function (response) {
      var shortRef = vm.nodeRef.substring(vm.nodeRef.lastIndexOf('/') + 1)
      var wopiSrcUrl = response.wopi_src_url
      var wopiFileURL = serviceUrl + '/wopi/files/' + shortRef
      var frameSrcURL = wopiSrcUrl + 'WOPISrc=' + encodeURIComponent(wopiFileURL)
      var accessToken = encodeURIComponent(response.access_token)
      // Use JQuery to submit the form and 'target' the iFrame
      $(function () {
        var form = '<form id="loleafletform" name="loleafletform" target="loleafletframe" action="' + frameSrcURL + '" method="post">' +
                    '<input name="access_token" value="' + encodeURIComponent(accessToken) + '" type="hidden"/></form>'

        $('#libreoffice-online').append(form)
        $('#loleafletform').submit()
      })
    })
      .catch(function (response) {
        vm.isDisplayed = false
      })
  }
}
