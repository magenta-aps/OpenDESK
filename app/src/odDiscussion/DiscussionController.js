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

function DiscussionController($scope, $log, $mdDialog, $state, $stateParams, discussionService,nodeRefUtilsService) {
    var dc = this;

    dc.discussions = [];
    dc.selectedDiscussion = discussionService.getSelectedDiscussion();
    dc.replies = [];

    dc.getDiscussions = function(siteShortName) {
        discussionService.getDiscussions(siteShortName).then(function(response) {
            dc.discussions = response.items;
            console.log('get discussions');
            console.log(dc.discussions);
        });
    }

    dc.getReplies = function(postItem) {
        console.log('get replies');
        discussionService.getReplies(postItem).then(function(response) {
            console.log(response);
            dc.replies = response;
        })
    }

    function init() {
        console.log('discussion controller init');
        dc.getDiscussions($stateParams.projekt);
        dc.getReplies(dc.selectedDiscussion);
    }
    init();

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

    dc.reply = function(content) {
        discussionService.addReply(dc.selectedDiscussion,content).then(function(response) {
            console.log(response);
            $mdDialog.cancel();
        })
    },

    dc.newDiscussionDialog = function() {
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

    dc.newDiscussion = function(title, content) {
        discussionService.addDiscussion($stateParams.projekt, title, content).then(function(response) {
            console.log(response);
            $mdDialog.cancel();
        });
    },

    dc.viewThread = function(postItem) {
        console.log('view thread');
        //dc.getReplies(postItem);
        //$state.go('project.viewthread');
        return '#!/projekter/' + $stateParams.projekt + '/diskussioner/' + nodeRefUtilsService.getId(postItem.nodeRef);
    }

    dc.deleteDiscussion = function(postItem) {
        discussionService.deletePost(postItem).then(function(response) {
            console.log(response);
        });
    }

    dc.viewDiscussions = function() {
        $state.go('project.discussions');
    }

    dc.cancel = function() {
        $mdDialog.cancel();
    }
};