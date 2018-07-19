angular
  .module('openDeskApp.chat')
  .controller('ChatController', ChatController)
  .directive('odChat', function () {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/src/odChat/view/chat.html'
    }
  })

function ChatController (chatService, APP_BACKEND_CONFIG) {
  if (APP_BACKEND_CONFIG.enableChat)
    chatService.initialize()
};
