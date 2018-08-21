'use strict'
import onlyOfficeTemplate from '../view/onlyOffice.html'

angular
  .module('openDeskApp')
  .directive('onlyOffice', function () {
    return {
      restrict: 'E',
      scope: {
        nodeRef: '=',
        sharedId: '='
      },
      template: onlyOfficeTemplate,
      controller: 'OnlyOfficePreviewController',
      controllerAs: 'vm'
    }
  })
