'use strict';

angular
.module('openDeskApp.notifications')
.directive('odNotifications', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'app/src/notifications/notifications.view.html',
        controller: 'NotificationsController',
        controllerAs: 'vm'
    };
});