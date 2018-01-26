
    'use strict';

    angular
        .module('openDeskApp.notifications')
        .factory('notificationsService', notificationsService);

        
        function notificationsService($http, $interval, sessionService) {
        
        var restBaseUrl = '/alfresco/service';
        var update;
        
        var unseenNotifications = 0;

        var userInfo = sessionService.getUserInfo();

        var service = {
            getUnseenCount: getUnseenCount,
            getNotifications: getNotifications,
            addNotice: addNotice,
            delNotice: delNotice,
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
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "getAll",
                PARAM_USERNAME: userId
            }).then(function(response) {
                // console.log(response.data);
                unseenNotifications = response.data[0].unseen;
                return response.data[1];
            });
        }

        function setRead(userId, noticeObj) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "setRead",
                PARAM_USERNAME: userId,
                PARAM_NODE_REF : noticeObj
            }).then(function(response) {
                return response;
            });
        }

        function getInfo(nodeRef) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "getInfo",
                PARAM_NODE_REF : nodeRef
            }).then(function(response) {
                return response.data[0];
            });
        }

        function setSeen(userId, noticeObj) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "setSeen",
                PARAM_USERNAME: userId,
                PARAM_NODE_REF : noticeObj
            }).then(function(response) {
                return response;
            });
        }

        function setAllSeen(userId) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "setAllNotificationsSeen",
                PARAM_USERNAME: userId
            }).then(function(response) {
                return response;
            });
        }

        function addNotice(userId, subject, message, link, wtype, project) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "add",
                PARAM_USERNAME: userId,
                PARAM_SUBJECT: subject,
                PARAM_MESSAGE: message,
                PARAM_LINK: link,
                PARAM_TYPE: wtype,
                PARAM_PROJECT: project
            }).then(function (response) {
                return response;
            });
        }
        
        function delNotice(userId, noticeObj) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "remove",
                PARAM_USERNAME: userId,
                PARAM_NODE_REF : noticeObj
            }).then(function(response) {
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
    