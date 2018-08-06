'use strict'
import onlyOfficeTemplate from '../view/onlyOffice.html'

angular
  .module('openDeskApp')
  .directive('onlyOffice', function () {
    return {
      restrict: 'E',
      scope: {
        nodeRef: '=nodeRef'
      },
      template: onlyOfficeTemplate,
      controller: 'OnlyOfficePreviewController',
      controllerAs: 'vm'
    }
  })
