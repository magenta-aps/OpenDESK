
    angular
        .module('openDeskApp.notifications')
        .factory('notificationsService', notificationsService);

    function notificationsService() {
        var service = {
            getNotices: getNotices,
            addNotice: addNotice,
            delNotice: delNotice
        };

        return service;

        function getNotices() {
            // Should return a user's unread notifications
            return [];
        };
        
        function addNotice() {
            console.log('Add notice');
            // adds a notification to a user's list of unread notifications
            return [];
        };
        
        function delNotice() {
            // removes a notification from a user's list of unread notifications (usually when she has read it)
            return [];
        };

    };
    