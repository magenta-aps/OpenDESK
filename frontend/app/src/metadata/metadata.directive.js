'use strict'
import editTemplate from './view/edit.html'
import viewTemplate from './view/view.html'

angular
  .module('openDeskApp.metadata')
  .directive('odEditMetadata', function () {
    return {
      restrict: 'E',
      scope: {
        node: '<'
      },
      template: editTemplate,
      controller: 'MetadataController',
      controllerAs: 'MC'
    }
  })
  .directive('odViewMetadata', function () {
    return {
      restrict: 'E',
      scope: {
        node: '<'
      },
      template: viewTemplate,
      controller: 'MetadataController',
      controllerAs: 'MC'
    }
  })
