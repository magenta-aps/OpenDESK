
    angular
        .module('openDeskApp.notifications')
        .factory('notificationsService', notificationsService);

    var restBaseUrl = '/alfresco/service';

    function notificationsService($http) {
        var service = {
            getNotices: getNotices,
            addNotice: addNotice,
            delNotice: delNotice,
            setReadNotice: setRead,
            getComment: getComment,
            setSeenNotice: setSeen,
            setAllSeen: setAllSeen
        };

        return service;

        function getNotices(userId) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "getAll",
                PARAM_USERNAME: userId
            }).then(function(response) {
              return response.data;
            })
        };


        function setRead(userId, noticeObj) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "setRead",
                PARAM_USERNAME: userId,
                PARAM_NODE_REF : noticeObj
            }).then(function(response) {
                return response;
            })
        };

        function getComment(nodeRef) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "getComment",
                PARAM_NODE_REF : nodeRef
            }).then(function(response) {

                return response.data[0].comment;
            })
        };


        function setSeen(userId, noticeObj) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "setSeen",
                PARAM_USERNAME: userId,
                PARAM_NODE_REF : noticeObj
            }).then(function(response) {
                return response;
            })
        };

        function setAllSeen(userId) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "setAllNotificationsSeen",
                PARAM_USERNAME: userId
            }).then(function(response) {
                return response;
            })
        };

        function addNotice(userId, subject, message, link) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "add",
                PARAM_USERNAME: userId,
                PARAM_SUBJECT: subject,
                PARAM_MESSAGE: message,
                PARAM_LINK: link
            }).then(function (response) {
                return response;
            })
        };
        
        function delNotice(userId, noticeObj) {
            return $http.post(restBaseUrl + "/notifications", {
                PARAM_METHOD : "remove",
                PARAM_USERNAME: userId,
                PARAM_NODE_REF : noticeObj
            }).then(function(response) {
                return response;
            })
        };

    }
    