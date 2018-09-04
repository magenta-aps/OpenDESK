'use strict'
import '../shared/services/nodeRefUtils.service'
import '../shared/services/preference.service'

angular.module('openDeskApp.discussion')
  .factory('discussionService', ['$http', 'nodeRefUtilsService', 'UserService', 'sessionService',
    'preferenceService', discussionService])

function discussionService ($http, nodeRefUtilsService, UserService, sessionService, preferenceService) {
  var restBaseUrl = '/alfresco/s/api'

  var service = {
    addDiscussion: addDiscussion,
    addReply: addReply,
    deletePost: deletePost,
    getDiscussionFromNodeRef: getDiscussionFromNodeRef,
    getDiscussions: getDiscussions,
    getReplies: getReplies,
    subscribeToDiscussion: subscribeToDiscussion,
    unSubscribeToDiscussion: unSubscribeToDiscussion,
    updatePost: updatePost
  }

  return service

  function getAvatarUrl (avatarRef) {
    if (avatarRef !== undefined) {
      var avatarId = avatarRef.split('/')[3]
      return sessionService.makeURL('/alfresco/s/api/node/workspace/SpacesStore/' + avatarId + '/content')
    } else { return 'assets/img/avatars/blank-profile-picture.png' }
  }

  function getDiscussionFromNodeRef (siteShortName, nodeId) {
    return $http.get(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + nodeId, {})
      .then(function (response) {
        return response.data.item
      })
  }

  function getDiscussions (siteShortName) {
    return $http.get(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', {})
      .then(function (response) {
        addSubscriptionFlag(siteShortName, response.data.items)
        return response.data
      })
  }

  function getReplies (postItem) {
    postItem.author.avatarUrl = getAvatarUrl(postItem.author.avatarRef)
    return $http.get(restBaseUrl + postItem.repliesUrl, {})
      .then(function (response) {
        var items = response.data.items
        items.forEach(function (reply) {
          reply.author.avatarUrl = getAvatarUrl(reply.author.avatarRef)
        })
        return items
      })
  }

  function addDiscussion (siteShortName, title, content) {
    return $http.post(restBaseUrl + '/forum/site/' + siteShortName + '/discussions/posts', {
      title: title,
      content: content
    }).then(function (response) {
      return response.data
    })
  }

  function addReply (postItem, content) {
    var id = nodeRefUtilsService.getId(postItem.nodeRef)
    return $http.post(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id + '/replies', {
      content: content
    }).then(function (response) {
      return response.data
    })
  }

  function updatePost (postItem, title, content) {
    var id = nodeRefUtilsService.getId(postItem.nodeRef)
    return $http.put(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, {
      title: title,
      content: content
    }).then(function (response) {
      return response.data
    })
  }

  function deletePost (postItem) {
    var id = nodeRefUtilsService.getId(postItem.nodeRef)
    return $http.delete(restBaseUrl + '/forum/post/node/workspace/SpacesStore/' + id, {}).then(function (response) {
      return response.data
    })
  }

  function subscribeToDiscussion (siteShortName, postItem) {
    setSubscribe(siteShortName, postItem, true)
  }

  function unSubscribeToDiscussion (siteShortName, postItem) {
    setSubscribe(siteShortName, postItem, false)
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

  function setSubscribe (siteShortName, postItem, value) {
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
      isSubscribedToDiscussion(siteShortName, postItem).then(function (response) {
        postItem.isSubscribed = response
      })
    })
  }
}
