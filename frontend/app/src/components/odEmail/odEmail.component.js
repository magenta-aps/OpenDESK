'use strict'
import sendTemplate from './view/send.html'

angular.module('odEmail')
  .component('odEmailSend', {
    template: sendTemplate,
    controller: 'odEmailController',
    bindings: {
      email: '<',
      isLoaded: '<'
    }
  })
