
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
            addWFNotice: addWFNotice
        };

        return service;

        function getNotices(userId) {
            return $http.get(restBaseUrl + "/notifications?userName=" + userId + "&method=getAll").then(function(response) {
              return response.data;
            })

        };


        function setRead(userId, noticeObj) {

            var s = noticeObj.split("/");
            var ref = (s[3])

            return $http.get(restBaseUrl + "/notifications?userName=" + userId + "&NODE_ID=" + ref + "&STORE_TYPE=workspace&STORE_ID=SpacesStore" + "&method=setRead").then(function(response) {
                return response;
            })
        };

        function addNotice(userId, subject, message) {
            return $http.get(restBaseUrl + "/notifications?userName=" + userId + "&message=" + message + "&subject=" + subject + "&method=add").then(function(response) {
                return response;
            })
        };

        function addWFNotice(creator, userId, subject, message, documentId) {
            return $http.get(restBaseUrl + "/notifications?userName=" + userId + "&message=" + message + "&subject=" + subject + "&creator=" + creator  + "&document=" + documentId + "&STORE_TYPE=workspace&STORE_ID=SpacesStore" + "&method=add" + "&type=wf").then(function(response) {
                return response;
            })
        };
        
        function delNotice(userId, noticeObj) {

            var s = noticeObj.split("/");
            var ref = (s[3])

            return $http.get(restBaseUrl + "/notifications?userName=" + userId + "&NODE_ID=" + ref + "&STORE_TYPE=workspace&STORE_ID=SpacesStore" + "&method=remove").then(function(response) {
                return response;
            })
        };

    };
    