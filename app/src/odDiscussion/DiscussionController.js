angular
    .module('openDeskApp.discussion')
    .controller('DiscussionController', DiscussionController)
    .directive('odDiscussion', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'app/src/odDiscussion/view/overview.html'
        };
    });

function DiscussionController($scope, $log, $mdDialog) {
    var dc = this;

    dc.replyDialog = function($scope) {
        $mdDialog.show({
            templateUrl: 'app/src/odDiscussion/view/reply.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.newThreadDialog = function() {
        console.log('ny thread');
        $mdDialog.show({
            templateUrl: 'app/src/odDiscussion/view/newThread.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.viewThread = function($scope) {
        $mdDialog.show({
            templateUrl: 'app/src/odDiscussion/view/conversation.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.cancel = function() {
        $mdDialog.cancel();
    }
};