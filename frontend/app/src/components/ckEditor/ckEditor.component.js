'use strict'
import ckEditorTemplate from './view/ckEditor.html'

angular.module('ckEditor')
  .component('ckEditor', {
    template: ckEditorTemplate,
    controller: 'ckEditorController',
    controllerAs: 'CKEC',
    bindings: {
      value: '<',
      callback: '<'
    }
  })
