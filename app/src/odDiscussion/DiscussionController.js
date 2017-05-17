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

function DiscussionController($scope, $log, $mdDialog, $state) {
    var dc = this;

    dc.replyDialog = function() {
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

    dc.viewThread = function() {
        $state.go('project.viewthread');
    }

    dc.viewDiscussions = function() {
        $state.go('project.discussions');
    }

    dc.cancel = function() {
        $mdDialog.cancel();
    }
};