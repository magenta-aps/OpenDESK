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

function DiscussionController($scope, $log, $mdDialog, $state, $stateParams, discussionService, nodeRefUtilsService, userService, sessionService) {
    var dc = this;

    dc.discussions = [];
    dc.selectedDiscussion = discussionService.getSelectedDiscussion();
    dc.replies = [];

    dc.getDiscussions = function(siteShortName) {
        discussionService.getDiscussions(siteShortName).then(function(response) {
            response.items.forEach(function (item) {
                if(item.lastReplyOn == undefined) {
                    item.lastReplyOn = item.modifiedOn;
                }
            });
            dc.discussions = response.items;
        });
    }

    dc.getReplies = function(postItem) {
        console.log('get replies');
        discussionService.getReplies(postItem).then(function(response) {
            dc.replies = response;

            for(var i=0;i<dc.replies.length;i++) {
                dc.replies[i].author.avatarUrl = dc.getAvatarUrl(dc.replies[i].author.avatarRef);
            }
        });
    }

    function init() {
        dc.getDiscussions($stateParams.projekt);
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
        return '#!/projekter/' + $stateParams.projekt + '/diskussioner/' + nodeRefUtilsService.getId(postItem.nodeRef);
    }

    dc.deleteDiscussion = function(postItem) {
        discussionService.deletePost(postItem).then(function(response) {
            console.log(response);
        });
    }

    dc.editReply = function(postItem,content) {
        discussionService.updatePost(postItem,'',content).then(function(response) {
            console.log(response);
            $mdDialog.cancel();
        });
    }

    dc.editReplyDialog = function(postItem) {
        $mdDialog.show({
            controller: ['$scope', 'postItem', function ($scope, postItem) {
                $scope.postItem = postItem;
            }],
            locals: {
                postItem: postItem
            },
            templateUrl: 'app/src/odDiscussion/view/edit.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.editFirstPost = function(postItem,title,content) {
        discussionService.updatePost(postItem,title,content).then(function(response) {
            console.log(response);
            $mdDialog.cancel();
        });
    }

    dc.editFirstPostDialog = function(postItem) {
        $mdDialog.show({
            controller: ['$scope', 'postItem', function ($scope, postItem) {
                $scope.postItem = postItem;
            }],
            locals: {
                postItem: postItem
            },
            templateUrl: 'app/src/odDiscussion/view/editFirstPost.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.viewDiscussions = function() {
        $state.go('project.discussions');
    }

    dc.cancel = function() {
        $mdDialog.cancel();
    }

    dc.subscribe = function(siteShortName,postItem) {
        
    }

    dc.getAvatarUrl = function(avatarRef) {
        var avatarId = avatarRef.split('/')[3];
        return sessionService.makeURL('/alfresco/s/api/node/workspace/SpacesStore/' + avatarId + '/content');
    }
};