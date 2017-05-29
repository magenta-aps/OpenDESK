'use strict';

angular.module('openDeskApp.discussion').factory('discussionService', function ($http, $q, nodeRefUtilsService, authService, sessionService, preferenceService) {

    var restBaseUrl = '/alfresco/s/api';
    var currentUser = authService.getUserInfo().user.userName;

    var selectedDiscussion = [];
    var replies = [];

    return {
        getSelectedDiscussion: getSelectedDiscussion,
        getDiscussions: getDiscussions,
        getReplies: getReplies,
        addDiscussion: addDiscussion,
        addReply: addReply,
        updatePost: updatePost,
        deletePost: deletePost,
        subscribeToDiscussion: subscribeToDiscussion,
        unSubscribeToDiscussion: unSubscribeToDiscussion,
        isSubscribedToDiscussion: isSubscribedToDiscussion,
        getSubscribePreferenceFilter: getSubscribePreferenceFilter,
        getDiscussionFromNodeRef: getDiscussionFromNodeRef
    };

    function getSelectedDiscussion() {
        return selectedDiscussion;
    }

    function getDiscussionFromNodeRef(siteShortName,nodeRef) {
        getDiscussions(siteShortName).then(function(response) {
            var discussions = response;
            console.log('find diskussion fra noderef');
            console.log(discussions);

            discussions.items.forEach(function(discussion) {
                if(discussion.nodeRef.split('/')[3] == nodeRef) {
                    console.log('den udvalgte');
                    console.log(discussion);
                    return discussion;
                }
            });
        });
    }

    function getDiscussions(siteShortName) {
        return $http.get(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', {}).then(function (response) {
            addSubscriptionFlag(siteShortName,response.data.items);
            console.log('get discussions data');
            console.log(response.data);
            return response.data;
        });
    }

    function getReplies(postItem) {
        selectedDiscussion = postItem;
        selectedDiscussion.author.avatarUrl = '';
        var avatarId = postItem.author.avatarRef.split('/')[3];
        selectedDiscussion.author.avatarUrl = sessionService.makeURL('/alfresco/s/api/node/workspace/SpacesStore/' + avatarId + '/content');
        return $http.get(restBaseUrl + postItem.repliesUrl, {}).then(function (response) {
            return response.data.items;
        });
    }

    function addDiscussion(siteShortName, title, content) {
        return $http.post(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', {
            title: title,
            content: content
        }).then(function (response) {
            return response.data;
        });
    }

    function addReply(postItem, content) {
        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        return $http.post(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id + "/replies", {
            content: content
        }).then(function (response) {
            return response.data;
        });
    }

    function updatePost(postItem, title, content) {
        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        return $http.put(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, {
            title: title,
            content: content
        }).then(function (response) {
            return response.data;
        });
    }

    function deletePost(postItem) {
        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        return $http.delete(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, {}).then(function (response) {
            return response.data;
        });
    }

    function subscribeToDiscussion(siteShortName, postItem) {
        setSubscribe(siteShortName, postItem, true);
    }

    function unSubscribeToDiscussion(siteShortName, postItem) {
        setSubscribe(siteShortName, postItem, false);
    }

    function isSubscribedToDiscussion(siteShortName, postItem) {

        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        var subscriptionsPreferenceFilter = getSubscribePreferenceFilter(siteShortName, id);

        return preferenceService.getPreferences(currentUser, subscriptionsPreferenceFilter).then(function (preferenceResponse) {
            if(preferenceResponse[subscriptionsPreferenceFilter] == undefined)
                return false;
            return preferenceResponse[subscriptionsPreferenceFilter];
        });
    }

    // Private methods

    function setSubscribe(siteShortName, postItem, value) {
        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        var preferenceFilter = getSubscribePreferenceFilter(siteShortName, id);
        var preferences = {};
        preferences[preferenceFilter] = value;

        preferenceService.setPreferences(currentUser, preferences).then(function (data) {
            return data;
        });
    }

    function getSubscribePreferenceFilter(siteShortName, id) {
        return "dk.magenta.sites." + siteShortName + ".discussions." + id + ".subscribe";
    }

    function getSiteSubscriptionsPreferenceFilter(siteShortName) {
        return "dk.magenta.sites." + siteShortName + ".discussions";
    }

    function addSubscriptionFlag(siteShortName, postItems) {
        postItems.forEach(function (postItem) {
            isSubscribedToDiscussion(siteShortName,postItem).then(function (response) {
                postItem.isSubscribed = response;
            });
        });
    }

});