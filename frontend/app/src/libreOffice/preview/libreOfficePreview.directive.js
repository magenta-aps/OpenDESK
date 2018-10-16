'use strict'
import libreOfficeTemplate from '../view/libreOffice.html'

angular
  .module('openDeskApp.libreOffice')
  .directive('libreOffice', function () {
    return {
      restrict: 'E',
      scope: {
        nodeRef: '=nodeRef'
      },
      template: libreOfficeTemplate,
      controller: 'LibreOfficePreviewController',
      controllerAs: 'LC'
    }
  })
