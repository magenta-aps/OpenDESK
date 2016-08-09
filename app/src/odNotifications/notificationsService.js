
    angular
        .module('openDeskApp.notifications')
        .factory('notificationsService', notificationsService);

    var restBaseUrl = '/alfresco/service';

    function notificationsService($http) {
        var service = {
            getNotices: getNotices,
            addNotice: addNotice,
            delNotice: delNotice
        };

        return service;

        function getNotices(userId) {
            return $http.get(restBaseUrl + "/notifications?userName=" + userId + "&method=getAll").then(function(response) {
              return response.data;
            })

        };






        
        function addNotice(userId, noticeObj) {
            console.log('Add notice');
            // adds a notification to a user's list of unread notifications
            return [];
        };
        
        function delNotice(userId) {
            // removes a notification from a user's list of unread notifications (usually when she has read it)
            console.log('Remove a notice');
            return [];
        };

    };
    