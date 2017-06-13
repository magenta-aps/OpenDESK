angular
    .module('openDeskApp.discussion', ['ng.ckeditor'])
    .controller('DiscussionController', DiscussionController);

function DiscussionController($scope, $log, $timeout, $mdDialog, $state, $stateParams, $interval, $anchorScroll, $location,
    discussionService, nodeRefUtilsService, userService, sessionService, notificationsService, siteService, preferenceService) {
    var dc = this;

    dc.discussions = [];
    dc.selectedDiscussion = discussionService.getSelectedDiscussion();
    dc.replies = [];
    dc.allMembers = [];
    dc.search = '';
    dc.user = '';
    dc.isLoading = true;

    dc.getDiscussions = function (siteShortName) {
        dc.isLoading = true;
        discussionService.getDiscussions(siteShortName).then(function (response) {
            response.items.forEach(function (item) {
                if (item.lastReplyOn == undefined) {
                    item.lastReplyOn = item.modifiedOn;
                }
            });
            dc.discussions = response.items;
            dc.isLoading = false;
        });
    }

    dc.getReplies = function (postItem) {
        dc.replies = '';
        discussionService.getReplies(postItem).then(function (response) {
            dc.replies = response;

            dc.replies.forEach(function (reply) {
                reply.author.avatarUrl = dc.getAvatarUrl(reply.author.avatarRef);
            });

            $timeout(function () {
                if ($location.hash()) {
                    console.log('scroll til ' + $location.hash());
                    $anchorScroll();
                }
            });
        });
    }

    function init() {
        dc.user = sessionService.getUserInfo().user;
        dc.getDiscussions($stateParams.projekt);
        //getAllMembers($stateParams.projekt, 'PD-Project');

        $scope.tab.selected = $state.current.data.selectedTab;

        if ($stateParams.path) {
            discussionService.getDiscussionFromNodeRef($stateParams.projekt, $stateParams.path).then(function (response) {
                dc.selectedDiscussion = discussionService.getSelectedDiscussion();
                dc.getReplies(dc.selectedDiscussion);
            });
        }
    }
    init();

    dc.replyDialog = function () {
        $mdDialog.show({
            templateUrl: 'app/src/odDiscussion/view/reply.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.reply = function (content) {
            discussionService.addReply(dc.selectedDiscussion, content).then(function (response) {
                discussionService.subscribeToDiscussion($stateParams.projekt, dc.selectedDiscussion);
                createReplyNotification(response.item);
                dc.getReplies(dc.selectedDiscussion);
                $mdDialog.cancel();
            })
        },

        dc.newDiscussionDialog = function () {
            $mdDialog.show({
                templateUrl: 'app/src/odDiscussion/view/newThread.tmpl.html',
                parent: angular.element(document.body),
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true
            });
        }

    dc.newDiscussion = function (title, content) {
            discussionService.addDiscussion($stateParams.projekt, title, content).then(function (response) {
                discussionService.subscribeToDiscussion($stateParams.projekt, response.item);
                createNewDiscussionNotification(response.item);
                dc.getDiscussions($stateParams.projekt);
                $mdDialog.cancel();
            });
        },

        dc.viewThread = function (postItem) {
            return '#!/projekter/' + $stateParams.projekt + '/diskussioner/' + nodeRefUtilsService.getId(postItem.nodeRef);
        }

    dc.deleteDiscussion = function (postItem) {
        discussionService.deletePost(postItem).then(function (response) {
            dc.getDiscussions($stateParams.projekt);
            dc.getReplies(dc.selectedDiscussion);
        });
    }

    dc.editReply = function (postItem, content) {
        discussionService.updatePost(postItem, '', content).then(function (response) {
            $mdDialog.cancel();
            dc.getReplies(dc.selectedDiscussion);
        });
    }

    dc.editReplyDialog = function (postItem) {
        $mdDialog.show({
            controller: ['$scope', 'postItem', function ($scope, postItem) {
                $scope.postItem = postItem;
            }],
            locals: {
                postItem: postItem
            },
            templateUrl: 'app/src/odDiscussion/view/edit.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.editFirstPost = function (postItem, title, content) {
        discussionService.updatePost(postItem, title, content).then(function (response) {
            $mdDialog.cancel();
        });
    }

    dc.editFirstPostDialog = function (postItem) {
        $mdDialog.show({
            controller: ['$scope', 'postItem', function ($scope, postItem) {
                $scope.postItem = postItem;
            }],
            locals: {
                postItem: postItem
            },
            templateUrl: 'app/src/odDiscussion/view/editFirstPost.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.editTitleDialog = function (postItem) {
        $mdDialog.show({
            controller: ['$scope', 'postItem', function ($scope, postItem) {
                $scope.postItem = postItem;
            }],
            locals: {
                postItem: postItem
            },
            templateUrl: 'app/src/odDiscussion/view/editTitle.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    dc.viewDiscussions = function () {
        $state.go('project.discussions');
    }

    dc.cancel = function () {
        $mdDialog.cancel();
    }

    dc.evaluateFilter = function () {
        if (dc.search == 'all') {
            dc.searchSubscribed = undefined;
            dc.searchUser = undefined;
        }
        if (dc.search == 'follow') {
            dc.searchUser = undefined;
            dc.searchSubscribed = "true";
        }

        if (dc.search == 'mine') {
            dc.searchSubscribed = undefined;
            dc.searchUser = dc.user.userName;
        }

        $interval(function () {}, 1, 1000);
    }

    dc.changeSubscription = function (postItem) {
        postItem.isSubscribed = !postItem.isSubscribed;

        if (postItem.isSubscribed) {
            discussionService.subscribeToDiscussion($stateParams.projekt, postItem);
        } else {
            discussionService.unSubscribeToDiscussion($stateParams.projekt, postItem);
        }
    }

    dc.subscriptionIcon = function (value) {
        return String(value) == "true" ? 'notifications_active' : 'notifications_none';
    }

    dc.getAvatarUrl = function (avatarRef) {
        if (avatarRef == undefined)
            return;
        var avatarId = avatarRef.split('/')[3];
        return sessionService.makeURL('/alfresco/s/api/node/workspace/SpacesStore/' + avatarId + '/content');
    }

    function createNotification(userName, subject, message, link, wtype, project) {
        console.log('creating notification...');
        notificationsService.addNotice(userName, subject, message, link, wtype, project).then(function (val) {
            $mdDialog.hide();
        });
    }

    function createNewDiscussionNotification(postItem) {
        var nodeRef = postItem.nodeRef.split('/')[3];
        var subject = 'Ny samtale i et projekt';
        var message = postItem.author.firstName + ' ' + postItem.author.lastName + ' har oprettet en ny diskussion';
        var link = '#!/projekter/' + $stateParams.projekt + '/diskussioner/' + nodeRef;

        // Iterating list of items.
        angular.forEach($scope.groups.list, function (group) {
            angular.forEach(group[1], function (member) {
                if (member.userName != postItem.author.username) {

                    var preferenceFilter = "dk.magenta.sites.receiveNotifications";
                    var receiveNotifications = "true";

                    if (member.preferences[preferenceFilter] != null)
                        receiveNotifications = member.preferences[preferenceFilter];

                    if (receiveNotifications != null && receiveNotifications == "true") {
                        console.log("Sending notification to : " + member.userName);
                        createNotification(member.userName, subject, message, link, 'new-discussion', $stateParams.projekt);
                    }
                }
            })
        })
    }

    function createReplyNotification(postItem) {
        var nodeRef = dc.selectedDiscussion.nodeRef.split('/')[3];
        var subject = 'Ny kommentar på en samtale du følger';
        var message = postItem.author.firstName + ' ' + postItem.author.lastName + ' har kommenteret på en samtale du følger';
        var link = '#!/projekter/' + $stateParams.projekt + '/diskussioner/' + nodeRef + '#' + postItem.name;

        // Iterating list of items.
        angular.forEach($scope.groups.list, function (group) {
            angular.forEach(group[1], function (member) {
                if (member.userName != postItem.author.username) {
                    var preferenceFilter = discussionService.getSubscribePreferenceFilter($stateParams.projekt, nodeRef);
                    var receiveNotifications = "false";

                    if (member.preferences[preferenceFilter] != null)
                        receiveNotifications = member.preferences[preferenceFilter];

                    if (receiveNotifications != null && receiveNotifications == "true") {
                        console.log("Sending notification to : " + member.userName);
                        createNotification(member.userName, subject, message, link, 'new-reply', $stateParams.projekt);
                    }
                }
            })
        })
    }
};