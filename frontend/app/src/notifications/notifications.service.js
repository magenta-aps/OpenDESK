
'use strict';

angular
  .module('openDeskApp.notifications')
  .factory('notificationsService', notificationsService);

  
function notificationsService($http, $interval) { 
  var restBaseUrl = '/alfresco/service/notifications';
  var update;
  var unseenNotifications = 0;

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
  };

  return service;

  function getUnseenCount() {
    return unseenNotifications;
  }

  function getNotifications(userId) {
    var payload = {
      PARAM_METHOD : "getAll",
      PARAM_USERNAME: userId
    }
    return $http.post(restBaseUrl, payload)
    .then(function(response) {
      unseenNotifications = response.data[0].unseen;
      return response.data[1];
    });
  }

  function setRead(userId, noticeObj) {
    var payload = {
      PARAM_METHOD : "setRead",
      PARAM_USERNAME: userId,
      PARAM_NODE_REF : noticeObj
    }

    return $http.post(restBaseUrl, payload)
    .then(function(response) {
      return response;
    });
  }

  function getInfo(nodeRef) {
    var payload = {
      PARAM_METHOD : "getInfo",
      PARAM_NODE_REF : nodeRef
    }

    return $http.post(restBaseUrl, payload)
    .then(function(response) {
      return response.data[0];
    });
  }

  function setSeen(userId, noticeObj) {
    var payload = {
      PARAM_METHOD : "setSeen",
      PARAM_USERNAME: userId,
      PARAM_NODE_REF : noticeObj
    }

    return $http.post(restBaseUrl, payload)
    .then(function(response) {
      return response;
    });
  }

  function setAllSeen(userId) {
    var payload = {
      PARAM_METHOD : "setAllNotificationsSeen",
      PARAM_USERNAME: userId
    }

    return $http.post(restBaseUrl, payload)
    .then(function(response) {
      return response;
    });
  }

  function addNotification(userId, subject, message, link, wtype, project) {
    var payload = {
      PARAM_METHOD : "add",
      PARAM_USERNAME: userId,
      PARAM_SUBJECT: subject,
      PARAM_MESSAGE: message,
      PARAM_LINK: link,
      PARAM_TYPE: wtype,
      PARAM_PROJECT: project
    }

    return $http.post(restBaseUrl, payload)
    .then(function (response) {
      return response;
    });
  }

  function addReplyNotice(userId, subject, message, link, wtype, project, nodeRef) {
    var payload = {
      PARAM_METHOD : "addReply",
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
      return response;
    });
  }
  
  function deleteNotification(userId, noticeObj) {
    var payload = {
      PARAM_METHOD : "remove",
      PARAM_USERNAME: userId,
      PARAM_NODE_REF : noticeObj
    }

    return $http.post(restBaseUrl, payload)
    .then(function(response) {
      return response;
    });
  }

  function startUpdate(updateNotifications) {
    update = $interval(updateNotifications, 10000);
  }

  function stopUpdate() {
    $interval.cancel(update);
  }
}
