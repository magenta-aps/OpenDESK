'use strict'
import chatTemplate from './view/chat.html'

angular
  .module('openDeskApp.chat')
  .controller('ChatController', ['chatService', 'APP_BACKEND_CONFIG', ChatController])
  .directive('odChat', function () {
    return {
      restrict: 'E',
      scope: {},
      template: chatTemplate
    }
  })

function ChatController (chatService, APP_BACKEND_CONFIG) {
  if (APP_BACKEND_CONFIG.enableChat)
    chatService.initialize()
}
