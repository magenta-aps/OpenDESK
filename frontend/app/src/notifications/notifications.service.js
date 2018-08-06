'use strict'

angular
  .module('openDeskApp.notifications')
  .factory('notificationsService', ['$http', '$interval', notificationsService])

function notificationsService ($http, $interval) {
  var restBaseUrl = '/alfresco/service/notifications'
  var update
  var unseenNotifications = 0

  var service = {
    getUnseenCount: getUnseenCount,
    get: getNotifications,
    delete: deleteNotification,
    setReadNotice: setRead,
    setSeenNotice: setSeen,
    setAllSeen: setAllSeen,
    startUpdate: startUpdate,
    stopUpdate: stopUpdate
  }

  return service

  function getUnseenCount () {
    return unseenNotifications
  }

  function getNotifications (userId) {
    var payload = {
      PARAM_METHOD: 'getAll',
      PARAM_USERNAME: userId
    }
    return $http.post(restBaseUrl, payload)
      .then(function (response) {
        unseenNotifications = response.data[0].unseen
        var notifications = response.data[1]
        angular.forEach(notifications, function (notification) {
          var params = notification.params
          if (params && params.type) {
            switch (notification.params.type) {
              case 'review':
                notification.link = 'document({doc: "' + params.nodeId + '", reviewId:"' + params.reviewId + '"})'
                notification.subject = 'Godkendelse af ' + params.nodeName
                notification.message = params.sender + ' har anmodet om godkendelse af dokumentet. Klik for at læse mere.'
                break
              case 'review-approved':
                notification.link = 'document({doc: "' + params.nodeId + '", reviewId:"' + params.reviewId + '"})'
                notification.subject = params.nodeName + ' er godkendt'
                notification.message = params.sender + ' har godkendt dokumentet. Klik for at læse mere.'
                break
              case 'review-rejected':
                notification.link = 'document({doc: "' + params.nodeId + '", reviewId:"' + params.reviewId + '"})'
                notification.subject = params.nodeName + ' er afvist'
                notification.message = params.sender + ' har afvist dokumentet. Klik for at læse mere.'
                break
              case 'review-reply':
                notification.link = 'document({doc: "' + params.nodeId + '", reviewId:"' + params.reviewId + '"})'
                notification.subject = 'Svar på godkendelse af ' + params.nodeName
                notification.message = params.sender + ' har svaret på godkendelsen af dokumentet. Klik for at læse mere.'
                break
              case 'site-content':
                notification.link = 'document({doc: "' + params.nodeId + '"})'
                notification.subject = 'Nyt dokument i ' + params.siteName
                notification.message = params.sender + ' har uploadet dokumentet ' + params.nodeName + '.'
                break
              case 'shared-content':
                notification.link = 'document({doc: "' + params.nodeId + '"})'
                notification.subject = 'Nyt delt dokument'
                notification.message = params.sender + ' har delt dokumentet ' + params.nodeName + ' med dig.'
                break
              case 'shared-folder':
                notification.link = 'odDocuments.sharedDocs({nodeRef: "' + params.nodeId + '"})'
                notification.subject = 'Ny delt mappe'
                notification.message = params.sender + ' har delt mappen ' + params.nodeName + ' med dig.'
                break
              case 'site-member':
                notification.link = 'project({projekt: "' + params.siteShortName + '"})'
                notification.subject = 'Du er blevet tilføjet til ' + params.siteName
                notification.message = params.sender + ' har tilføjet dig som medlem.'
                break
              case 'discussion':
                notification.link = 'project.viewthread({projekt: "' + params.siteShortName + '", path: "' + params.nodeId + '"})'
                notification.subject = 'Ny kommentar i ' + params.siteName
                notification.message = params.sender + ' har oprettet en ny kommentar.'
                break
              case 'reply':
                notification.link = 'project.viewthread({projekt: "' + params.siteShortName + '", path: "' + params.nodeId + '#' + params.replyShortName + '"})'
                notification.subject = 'Nyt svar i kommentaren ' + params.nodeName
                notification.message = params.sender + ' har svaret på kommentaren, du følger i ' + params.siteName + '.'
                break
            }
          } else {
            notification.link = ''
            notification.subject = ''
            notification.message = ''
          }
        })
        return notifications
      })
  }

  function setRead (userId, noticeObj) {
    var payload = {
      PARAM_METHOD: 'setRead',
      PARAM_USERNAME: userId,
      PARAM_NODE_REF: noticeObj
    }

    return $http.post(restBaseUrl, payload)
      .then(function (response) {
        return response
      })
  }

  function setSeen (userId, noticeObj) {
    var payload = {
      PARAM_METHOD: 'setSeen',
      PARAM_USERNAME: userId,
      PARAM_NODE_REF: noticeObj
    }

    return $http.post(restBaseUrl, payload)
      .then(function (response) {
        return response
      })
  }

  function setAllSeen (userId) {
    var payload = {
      PARAM_METHOD: 'setAllNotificationsSeen',
      PARAM_USERNAME: userId
    }

    return $http.post(restBaseUrl, payload)
      .then(function (response) {
        return response
      })
  }

  function deleteNotification (userId, noticeObj) {
    var payload = {
      PARAM_METHOD: 'remove',
      PARAM_USERNAME: userId,
      PARAM_NODE_REF: noticeObj
    }

    return $http.post(restBaseUrl, payload)
      .then(function (response) {
        return response
      })
  }

  function startUpdate (updateNotifications) {
    update = $interval(updateNotifications, 10000)
  }

  function stopUpdate () {
    $interval.cancel(update)
  }
}
