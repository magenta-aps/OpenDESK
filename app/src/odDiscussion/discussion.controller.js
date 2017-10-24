angular
    .module('openDeskApp.discussion')
    .controller('DiscussionController', DiscussionController);

function DiscussionController(APP_CONFIG, $scope, $timeout, $mdDialog, $state, $stateParams, $interval, $anchorScroll, $location,
    discussionService, nodeRefUtilsService, sessionService, notificationsService) {
    var vm = this;

    vm.discussions = [];
    vm.selectedDiscussion = discussionService.getSelectedDiscussion();
    vm.replies = [];
    vm.allMembers = [];
    vm.search = '';
    vm.user = '';
    vm.isLoading = true;

    vm.cancelDialog = cancelDialog;
    vm.changeSubscription = changeSubscription;
    vm.deleteDiscussion = deleteDiscussion;
    vm.editFirstPost = editFirstPost;
    vm.editFirstPostDialog = editFirstPostDialog;
    vm.editReply = editReply;
    vm.editReplyDialog = editReplyDialog;
    vm.editTitleDialog = editTitleDialog;
    vm.evaluateFilter = evaluateFilter;
    vm.getAvatarUrl = getAvatarUrl;
    vm.getDiscussions = getDiscussions;
    vm.getReplies = getReplies;
    vm.newDiscussion = newDiscussion;
    vm.newDiscussionDialog = newDiscussionDialog;
    vm.reply = reply;
    vm.replyDialog = replyDialog;
    vm.subscriptionIcon = subscriptionIcon;
    vm.viewDiscussions = viewDiscussions;
    vm.viewThread = viewThread;

    //sets the margin to the width of sidenav
    var tableHeight = $(window).height() - 300 - $("header").outerHeight() - $("md-tabs-wrapper").outerHeight();
    $(".od-discussion").css("max-height", tableHeight + "px");

    activate();

    function activate() {
        vm.user = sessionService.getUserInfo().user;
        vm.getDiscussions($stateParams.projekt);

        $scope.tab.selected = $stateParams.selectedTab;

        if ($stateParams.path) {
            discussionService.getDiscussionFromNodeRef($stateParams.projekt, $stateParams.path).then(function (response) {
                vm.selectedDiscussion = discussionService.getSelectedDiscussion();
                vm.getReplies(vm.selectedDiscussion);
            });
        }
    }

    function cancelDialog() {
        $mdDialog.cancel();
    }

    function getDiscussions(siteShortName) {
        vm.isLoading = true;
        discussionService.getDiscussions(siteShortName).then(function (response) {
            response.items.forEach(function (item) {
                if (item.lastReplyOn == undefined) {
                    item.lastReplyOn = item.modifiedOn;
                }
            });
            vm.discussions = response.items;
            vm.isLoading = false;
        });
    }

    function getReplies(postItem) {
        vm.replies = '';
        discussionService.getReplies(postItem).then(function (response) {
            vm.replies = response;

            vm.replies.forEach(function (reply) {
                reply.author.avatarUrl = vm.getAvatarUrl(reply.author.avatarRef);
            });

            $timeout(function () {
                if ($location.hash()) {
                    console.log('scroll til ' + $location.hash());
                    $anchorScroll();
                }
            });
        });
    }

    function replyDialog() {
        $mdDialog.show({
            templateUrl: 'app/src/odDiscussion/view/reply.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    function reply(content) {
        discussionService.addReply(vm.selectedDiscussion, content).then(function (response) {
            discussionService.subscribeToDiscussion($stateParams.projekt, vm.selectedDiscussion);
            createReplyNotification(response.item);
            vm.getReplies(vm.selectedDiscussion);
            $mdDialog.cancel();
        })
    }

    function newDiscussionDialog() {
        $mdDialog.show({
            templateUrl: 'app/src/odDiscussion/view/newThread.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    function newDiscussion(title, content) {
        discussionService.addDiscussion($stateParams.projekt, title, content).then(function (response) {
            discussionService.subscribeToDiscussion($stateParams.projekt, response.item);
            createNewDiscussionNotification(response.item);
            vm.getDiscussions($stateParams.projekt);
            $mdDialog.cancel();
        });
    }


    function viewThread(postItem) {
        return '#!/' + APP_CONFIG.sitesUrl + '/' + $stateParams.projekt + '/diskussioner/' + nodeRefUtilsService.getId(postItem.nodeRef);
    }


    function deleteDiscussion(postItem) {
        discussionService.deletePost(postItem).then(function (response) {
            vm.getDiscussions($stateParams.projekt);
            vm.getReplies(vm.selectedDiscussion);
        });
    }


    function editReply(postItem, content) {
        discussionService.updatePost(postItem, '', content).then(function (response) {
            $mdDialog.cancel();
            vm.getReplies(vm.selectedDiscussion);
        });
    }


    function editReplyDialog(postItem) {
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


    function editFirstPost(postItem, title, content) {
        discussionService.updatePost(postItem, title, content).then(function (response) {
            $mdDialog.cancel();
        });
    }


    function editFirstPostDialog(postItem) {
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

    function editTitleDialog(postItem) {
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

    function viewDiscussions() {
        $state.go('project.discussions');
    }

    function evaluateFilter() {
        if (vm.search == 'all') {
            vm.searchSubscribed = undefined;
            vm.searchUser = undefined;
        }
        if (vm.search == 'follow') {
            vm.searchUser = undefined;
            vm.searchSubscribed = "true";
        }

        if (vm.search == 'mine') {
            vm.searchSubscribed = undefined;
            vm.searchUser = vm.user.userName;
        }

        $interval(function () {}, 1, 1000);
    }


    function changeSubscription(postItem) {
        postItem.isSubscribed = !postItem.isSubscribed;

        if (postItem.isSubscribed) {
            discussionService.subscribeToDiscussion($stateParams.projekt, postItem);
        } else {
            discussionService.unSubscribeToDiscussion($stateParams.projekt, postItem);
        }
    }


    function subscriptionIcon(value) {
        return String(value) == "true" ? 'notifications_active' : 'notifications_none';
    }


    function getAvatarUrl(avatarRef) {
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
        var link = '#!/' + APP_CONFIG.sitesUrl + '/' + $stateParams.projekt + '/diskussioner/' + nodeRef;

        // Iterating list of items.
        angular.forEach(vm.groups, function (group) {
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
        var nodeRef = vm.selectedDiscussion.nodeRef.split('/')[3];
        var subject = 'Ny kommentar på en samtale du følger';
        var message = postItem.author.firstName + ' ' + postItem.author.lastName + ' har kommenteret på en samtale du følger';
        var link = '#!/' + APP_CONFIG.sitesUrl + '/' + $stateParams.projekt + '/diskussioner/' + nodeRef + '#' + postItem.name;

        // Iterating list of items.
        angular.forEach(vm.groups, function (group) {
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