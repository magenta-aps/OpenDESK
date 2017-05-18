'use strict';

angular.module('openDeskApp.discussion').factory('discussionService', function ($http, nodeRefUtilsService, authService) {

    var restBaseUrl = '/alfresco/s/api';
    var currentUser = authService.getUserInfo().user.userName;

    return {
        getDiscussions : getDiscussions,
        getMyDiscussions : getMyDiscussions,
        getSubscribedDiscussions : getSubscribedDiscussions,
        getReplies : getReplies,
        addDiscussion : addDiscussion,
        addPost : addPost,
        updatePost : updatePost,
        deletePost : deletePost,
        subscribeToDiscussion : subscribeToDiscussion,
        unSubscribeToDiscussion : unSubscribeToDiscussion
    };

    function getDiscussions(siteShortName) {
        return $http.get(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', {}).then(function (response) {
            return response.data;
        });
    }

    function getMyDiscussions (siteShortName) {
        return $http.get(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts/myposts', {}).then(function (response) {
            return response.data;
        });
    }

    function getSubscribedDiscussions (siteShortName) {
        return getDiscussions(siteShortName).then(function (discussionResponse) {

            var discussions = discussionResponse.data.items;
            var subscriptionsPreferenceFilter = getSiteSubscriptionsPreferenceFilter(siteShortName);

            return preferenceService.getPreferences(vm.currentUser, subscriptionsPreferenceFilter).then(function (preferenceResponse) {

                var subscribedDiscussions = [];
                for(var i = 0; i < discussions.length; i++) {
                    var postItem = discussions[i];
                    var id = nodeRefUtilsService.getId(postItem.nodeRef);
                    var postPreferenceFilter = getSubscribePreferenceFilter(siteShortName, id);
                    if (preferenceResponse[postPreferenceFilter])
                        subscribedDiscussions.push(postItem);
                }
                return subscribedDiscussions;
            });
        });
    }

    function getReplies (postItem) {
        return $http.get(restBaseUrl + postItem.repliesUrl, {}).then(function (response) {
            return response.data.items;
        });
    }

    function addDiscussion (siteShortName, title, content) {
        return $http.post(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', {
            title : title,
            content: content
        }).then(function (response) {
            return response.data;
        });
    }

    function addPost (postItem, content) {
        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        return $http.post(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id + "/replies", {
            content: content
        }).then(function (response) {
            return response.data;
        });
    }

    function updatePost (postItem, title, content) {
        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        return $http.put(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, {
            title : title,
            content: content
        }).then(function (response) {
            return response.data;
        });
    }

    function deletePost (postItem) {
        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        return $http.delete(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, {}).then(function (response) {
            return response.data;
        });
    }

    function subscribeToDiscussion (siteShortName, postItem) {
        setSubscribe(siteShortName, postItem, true);
    }

    function unSubscribeToDiscussion (siteShortName, postItem) {
        setSubscribe(siteShortName, postItem, false);
    }

    // Private methods

    function setSubscribe(siteShortName, postItem, value) {
        var id = nodeRefUtilsService.getId(postItem.nodeRef);
        var preferenceFilter = getSubscribePreferenceFilter(siteShortName, id);
        var preferences = { };
        preferences[preferenceFilter] = value;

        preferenceService.setPreferences(currentUser, preferences).then(function(data) {
            return data;
        });
    }

    function getSubscribePreferenceFilter(siteShortName, id) {
        return "dk.magenta.sites." + siteShortName + ".discussions." + id + ".subscribe";
    }

    function getSiteSubscriptionsPreferenceFilter(siteShortName) {
        return "dk.magenta.sites." + siteShortName + ".discussions";
    }

});
