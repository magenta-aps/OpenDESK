
    angular
        .module('openDeskApp.notifications')
        .controller('NotificationsController', NotificationsController)
        .directive('odNotifications', function() {
            return {
              restrict: 'E',
              scope: {},
              templateUrl: '/app/src/odNotifications/view/notifications.html'
            };
        });

    function NotificationsController($scope, $timeout, $log, notificationsService) {
        var vm = this;
        
        vm.on = false;
        vm.toggleNotices = function() {
            vm.on = !vm.on;
        }
        
        // Fake interactions for UI demo -- REMOVE
        $timeout(notificationsService.addNotice('someone'), 5000);

    };
