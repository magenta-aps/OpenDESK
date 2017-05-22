'use strict';

angular.module('openDeskApp.discussion').factory('discussionService', function ($http, nodeRefUtilsService) {

    var restBaseUrl = '/alfresco/s/api';

    var selectedDiscussion = [];
    var replies = [];

    return {
        getDiscussions : function(siteShortName) {
            return $http.get(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', {}).then(function (response) {
                return response.data;
            });
        },

        getMyDiscussions : function(siteShortName) {
            return $http.get(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts/myposts', {}).then(function (response) {
                return response.data;
            });
        },

        getSubscribedDiscussions : function (siteShortName) {

        },

        getReplies : function(postItem) {
            selectedDiscussion = postItem;
            console.log('discussion service set selected discussion');
            console.log(selectedDiscussion);
            return $http.get(restBaseUrl + postItem.repliesUrl, {}).then(function (response) {
                return response.data.items;
            });
        },

        getSelectedDiscussion : function() {
            return selectedDiscussion;
        },

        addDiscussion : function(siteShortName, title, content) {
            return $http.post(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', {
                title : title,
                content: content
            }).then(function (response) {
                return response.data;
            });
        },

        addReply : function(postItem, content) {
            var id = nodeRefUtilsService.getId(postItem.nodeRef);
            return $http.post(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id + "/replies", {
                content: content
            }).then(function (response) {
                return response.data;
            });
        },

        updatePost : function(postItem, title, content) {
            var id = nodeRefUtilsService.getId(postItem.nodeRef);
            return $http.put(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, {
                title : title,
                content: content
            }).then(function (response) {
                return response.data;
            });
        },

        deletePost : function(postItem) {
            var id = nodeRefUtilsService.getId(postItem.nodeRef);
            return $http.delete(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, {}).then(function (response) {
                return response.data;
            });
        },

        subscribeToDiscussion : function (postItem) {

        },

        unSubscribeToDiscussion : function (postItem) {

        }


    };
});
