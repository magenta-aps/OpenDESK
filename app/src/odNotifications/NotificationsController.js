
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

    function NotificationsController($scope, $timeout, $mdSidenav, $log) {
        var vm = this;
        
        vm.on = false;
        vm.toggleNotices = function() {
            vm.on = !vm.on;
        }

    };
