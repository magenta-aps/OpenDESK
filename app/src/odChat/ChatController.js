angular
    .module('openDeskApp.chat')
    .controller('ChatController', ChatController)
    .directive('odChat', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/app/src/odChat/view/chat.html'
        };
    });

function ChatController($scope, chatService) {
    var vm = this;

    chatService.initialize();
};
