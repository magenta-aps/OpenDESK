angular
    .module('openDeskApp.discussion', ['ng.ckeditor'])
    .controller('DiscussionController', DiscussionController);

function DiscussionController($scope, $log, $mdDialog, $state, $stateParams, $interval, $anchorScroll, $location, discussionService, nodeRefUtilsService, 
                            userService, sessionService, notificationsService, siteService, preferenceService) {
    var dc = this;

    dc.discussions = [];
    dc.selectedDiscussion = discussionService.getSelectedDiscussion();
    dc.replies = [];
    dc.allMembers = [];
    dc.search = '';
    dc.user = '';

    $scope.scrollTo = function(id) {
      $location.hash(id);
      $anchorScroll();
   }

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

            dc.replies.forEach(function (reply) {
                reply.author.avatarUrl = dc.getAvatarUrl(reply.author.avatarRef);
            });
            
        });
    }

    function init() {
        dc.user = sessionService.getUserInfo().user;
        dc.getDiscussions($stateParams.projekt);
        getAllMembers($stateParams.projekt,'PD-Project');

        $scope.selectedTab = $state.current.data.selectedTab;

        if($stateParams.path) {
            discussionService.getDiscussionFromNodeRef($stateParams.projekt,$stateParams.path).then(function(response) {
                dc.selectedDiscussion = discussionService.getSelectedDiscussion();
                dc.getReplies(dc.selectedDiscussion);
            });
        }
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
            discussionService.subscribeToDiscussion($stateParams.projekt,dc.selectedDiscussion);
            dc.createNotification(response.item);
            dc.getReplies(dc.selectedDiscussion);
            $mdDialog.cancel();
        })
    },

    dc.newDiscussionDialog = function() {
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
            discussionService.subscribeToDiscussion($stateParams.projekt,response.item);
            dc.newDiscussionNotification(response.item);
            dc.getDiscussions($stateParams.projekt);
            $mdDialog.cancel();
        });
    },

    dc.viewThread = function(postItem) {
        return '#!/projekter/' + $stateParams.projekt + '/diskussioner/' + nodeRefUtilsService.getId(postItem.nodeRef);
    }

    dc.deleteDiscussion = function(postItem) {
        discussionService.deletePost(postItem).then(function(response) {
            dc.getDiscussions($stateParams.projekt);
            dc.getReplies(dc.selectedDiscussion);
        });
    }

    dc.editReply = function(postItem,content) {
        discussionService.updatePost(postItem,'',content).then(function(response) {
            console.log(response);
            $mdDialog.cancel();
            dc.getReplies(dc.selectedDiscussion);
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

    dc.editTitleDialog = function(postItem) {
        $mdDialog.show({
            controller: ['$scope', 'postItem', function ($scope, postItem) {
                $scope.postItem = postItem;
            }],
            locals: {
                postItem: postItem
            },
            templateUrl: 'app/src/odDiscussion/view/editTitle.tmpl.html',
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

    dc.evaluateFilter = function() {
        if(dc.search == 'all') {
            dc.searchSubscribed = undefined;
            dc.searchUser = undefined;
            console.log('clear search');
        }
        if(dc.search == 'follow') {
            dc.searchUser = undefined;
            dc.searchSubscribed = "true";
        }

        if(dc.search == 'mine') {
            dc.searchSubscribed = undefined;
            dc.searchUser = dc.user.userName;
        }

        $interval(function(){}, 1,1000);
    }

    dc.changeSubscription = function(postItem) {
        postItem.isSubscribed = !postItem.isSubscribed;

        if(postItem.isSubscribed) {
            discussionService.subscribeToDiscussion($stateParams.projekt,postItem);
        } else {
            discussionService.unSubscribeToDiscussion($stateParams.projekt,postItem);
        }
    }

    dc.subscriptionIcon = function(value) {
        if(value) {
            return 'notifications_active';
        } else {
            return 'notifications_none';
        }
    }

    dc.getAvatarUrl = function(avatarRef) {
        if(avatarRef == undefined)
            return;
        var avatarId = avatarRef.split('/')[3];
        return sessionService.makeURL('/alfresco/s/api/node/workspace/SpacesStore/' + avatarId + '/content');
    }

    function getAllMembers(siteShortName,siteType) {
        siteService.getAllMembers(siteShortName,siteType).then(function(response) {
            dc.allMembers = response;
        });
    }

    dc.newDiscussionNotification = function(postItem) {
        console.log('creating notification...');

        dc.allMembers.forEach(function (username) {
            if (username != postItem.author.username) {
                var nodeRef = postItem.nodeRef.split('/')[3];
                var preferenceFilter = "dk.magenta.sites.receiveNotifications";

                preferenceService.getPreferences(username, preferenceFilter).then(function (data) {
                    var receiveNotifications = "true";
                    if (data[preferenceFilter] != null) {
                        receiveNotifications = data[preferenceFilter];
                    }
                    console.log(receiveNotifications);
                    if (receiveNotifications != null && receiveNotifications == "true") {
                        console.log("Sending notification to : " + username);
                        var subject = 'Ny samtale i [projekt navn]';
                        var message = postItem.author.firstName + ' ' + postItem.author.lastName + ' har oprettet en ny samtale med titlen ' + postItem.title;
                        var link = '#!/projekter/' + $stateParams.projekt + '/diskussioner/' + nodeRef;
                        
                        notificationsService.addNotice(username, subject, message, link, 'new-reply', $stateParams.projekt);
                    }
                });
            }
        });
    }


    dc.createNotification = function(postItem) {
        console.log('creating notification...');

        dc.allMembers.forEach(function (username) {
            if (username != postItem.author.username) {
                var nodeRef = dc.selectedDiscussion.nodeRef.split('/')[3];
                var preferenceFilter = discussionService.getSubscribePreferenceFilter($stateParams.projekt,nodeRef);

                preferenceService.getPreferences(username, preferenceFilter).then(function (data) {

                    var receiveNotifications = "false";
                    if (data[preferenceFilter] != null) {
                        receiveNotifications = data[preferenceFilter];
                    }
                    if (receiveNotifications != null && receiveNotifications == "true") {
                        console.log("Sending notification to : " + username);
                        var subject = 'Ny kommentar på en samtale du følger';
                        var message = postItem.author.firstName + ' ' + postItem.author.lastName + ' har kommenteret på en samtale du følger';
                        var link = '#!/projekter/' + $stateParams.projekt + '/diskussioner/' + nodeRef + '#' + postItem.name;
                        
                        notificationsService.addNotice(username, subject, message, link, 'new-reply', $stateParams.projekt);
                    }
                });
            }
        });
    }

};