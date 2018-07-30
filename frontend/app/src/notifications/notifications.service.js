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
    add: addNotification,
    addReplyNotice: addReplyNotice,
    delete: deleteNotification,
    setReadNotice: setRead,
    getInfo: getInfo,
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
        unseenNotifications = response.data[0].unseen;
        var notifications = response.data[1];
        angular.forEach(notifications, function (notification) {

          switch(notification.type) {
            case 'review':
              break;
            case 'review-approved':
              break;
            case 'review-rejected':
              break;
            case 'content':
              break;
            case 'shared-content':
              break;
            case 'site':
              break;
            case 'discussion':
              notification.link = '';
              notification.subject = 'Ny samtale i et projekt';
              notification.message = notification.params.sender + ' har oprettet en ny diskussion';
              break;
            case 'reply':
              break;
          }
          notification.link = '';
          notification.subject = '';
          notification.message = '';

          /*
<p ng-if="notice.type == 'review'" class="od-notifylist--item--desc">{{notice.from}} har bedt dig om at reviewe et dokument i projektet {{notice.project}}</p>
<p ng-if="notice.type == 'review-approved'"  class="od-notifylist--item--desc">{{notice.from}} har godkendt dit review i projektet {{notice.project}} med en kommentar</p>
<p ng-if="notice.type == 'review-rejected'"  class="od-notifylist--item--desc">{{notice.from}} har afvist dit review i projektet {{notice.project}} med en kommentar</p>
<p ng-if="notice.type == 'content'"  class="od-notifylist--item--desc">{{notice.from}} har lagt et nyt dokument i projektet {{notice.project}}</p>
<p ng-if="notice.type == 'shared-content'"  class="od-notifylist--item--desc">{{notice.from}} har delt et dokument med dig</p>
<p ng-if="notice.type == 'site'" class="od-notifylist--item--desc">{{notice.message}}</p>
<p ng-if="notice.type == 'reply'" class="od-notifylist--item--desc">{{notice.message}}</p>
<p ng-if="notice.type == 'discussion'" class="od-notifylist--item--desc">{{notice.message}}</p>
           */
        });
        return notifications;
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

  function getInfo (nodeRef) {
    var payload = {
      PARAM_METHOD: 'getInfo',
      PARAM_NODE_REF: nodeRef
    }

    return $http.post(restBaseUrl, payload)
      .then(function (response) {
        return response.data[0]
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

  function addNotification (userId, subject, message, link, wtype, project) {
    var payload = {
      PARAM_METHOD: 'add',
      PARAM_USERNAME: userId,
      PARAM_SUBJECT: subject,
      PARAM_MESSAGE: message,
      PARAM_LINK: link,
      PARAM_TYPE: wtype,
      PARAM_PROJECT: project
    }

    return $http.post(restBaseUrl, payload)
      .then(function (response) {
        return response
      })
  }

  function addReplyNotice (userId, subject, message, link, wtype, project, nodeRef) {
    var payload = {
      PARAM_METHOD: 'addReply',
      PARAM_USERNAME: userId,
      PARAM_SUBJECT: subject,
      PARAM_MESSAGE: message,
      PARAM_LINK: link,
      PARAM_TYPE: wtype,
      PARAM_PROJECT: project,
      PARAM_NODE_REF: nodeRef
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
