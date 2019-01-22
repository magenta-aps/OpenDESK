'use strict'
import conversationEntry from './view/conversationEntry.html'

angular
  .module('openDeskApp.discussion')
  .directive('conversationEntry', function () {
    return {
      restrict: 'A',
      scope: {
        'entry': '=',
        'editAction': '&',
        'deleteAction': '&'
      },
      template: conversationEntry
    }
  })
