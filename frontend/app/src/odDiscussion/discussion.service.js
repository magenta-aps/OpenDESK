'use strict'
import '../shared/services/nodeRefUtils.service'
import '../shared/services/preference.service'

angular.module('openDeskApp.discussion')
  .factory('discussionService', ['$http', 'nodeRefUtilsService', 'sessionService', 'preferenceService', discussionService])

function discussionService ($http, nodeRefUtilsService, sessionService, preferenceService) {
  var restBaseUrl = '/alfresco/s/api'

  var service = {
    addDiscussion: addDiscussion,
    addReply: addReply,
    deletePost: deletePost,
    getDiscussionFromNodeRef: getDiscussionFromNodeRef,
    getDiscussions: getDiscussions,
    getReplies: getReplies,
    subscribe: subscribe,
    updatePost: updatePost
  }

  return service

  function getAvatarUrl (avatarRef) {
    if (avatarRef !== undefined) {
      var avatarId = avatarRef.split('/')[3]
      return sessionService.makeURL('/alfresco/s/api/node/workspace/SpacesStore/' + avatarId + '/content')
    } else { return 'assets/img/avatars/blank-profile-picture.png' }
  }

  function getDiscussionFromNodeRef (nodeId) {
    return $http.get(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + nodeId)
      .then(function (response) {
        return response.data.item
      })
  }

  function getDiscussions (siteShortName) {
    return $http.get(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts')
      .then(function (response) {
        addSubscriptionFlag(siteShortName, response.data.items)
        return response.data
      })
  }

  function getReplies (postItem) {
    postItem.author.avatarUrl = getAvatarUrl(postItem.author.avatarRef)
    return $http.get(restBaseUrl + postItem.repliesUrl)
      .then(function (response) {
        var items = response.data.items
        items.forEach(function (reply) {
          reply.author.avatarUrl = getAvatarUrl(reply.author.avatarRef)
        })
        return items
      })
  }

  function addDiscussion (siteShortName, title, content) {
    var payload = {
      title: title,
      content: content
    }

    return $http.post(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', payload)
      .then(function (response) {
        return response.data
      })
  }

  function addReply (postItem, content) {
    var id = nodeRefUtilsService.getId(postItem.nodeRef)
    var payload = { content: content }
    return $http.post(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id + '/replies', payload)
      .then(function (response) {
        return response.data
      })
  }

  function updatePost (postItem, title, content) {
    var id = nodeRefUtilsService.getId(postItem.nodeRef)
    var payload = {
      title: title,
      content: content
    }
    return $http.put(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, payload)
      .then(function (response) {
        return response.data
      })
  }

  function deletePost (postItem) {
    var id = nodeRefUtilsService.getId(postItem.nodeRef)
    return $http.delete(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id)
      .then(function (response) {
        return response.data
      })
  }

  function isSubscribedToDiscussion (siteShortName, postItem) {
    var id = nodeRefUtilsService.getId(postItem.nodeRef)
    var subscriptionsPreferenceFilter = getSubscribePreferenceFilter(siteShortName, id)

    return preferenceService.getPreferences(subscriptionsPreferenceFilter)
      .then(function (preferenceResponse) {
        if (preferenceResponse[subscriptionsPreferenceFilter] === undefined) return false
        return preferenceResponse[subscriptionsPreferenceFilter]
      })
  }

  // Private methods

  function subscribe (siteShortName, postItem, value) {
    var id = nodeRefUtilsService.getId(postItem.nodeRef)
    var preferenceFilter = getSubscribePreferenceFilter(siteShortName, id)
    var preferences = {}
    preferences[preferenceFilter] = value

    preferenceService.setPreferences(preferences)
  }

  function getSubscribePreferenceFilter (siteShortName, id) {
    return 'dk.magenta.sites.' + siteShortName + '.discussions.' + id + '.subscribe'
  }

  function addSubscriptionFlag (siteShortName, postItems) {
    postItems.forEach(function (postItem) {
      isSubscribedToDiscussion(siteShortName, postItem)
        .then(function (response) {
          postItem.isSubscribed = response
        })
    })
  }
}
