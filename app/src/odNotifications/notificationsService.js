
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

        function getNotices(userId) {
            // Should return a user's unread notifications
            console.log('Listing all notices');
            return [];
        };
        
        function addNotice(userId) {
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
    