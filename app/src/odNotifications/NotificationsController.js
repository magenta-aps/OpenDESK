
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

    function NotificationsController($scope, $timeout, $log, $mdToast, notificationsService) {
        var vm = this;
        
        vm.on = false;
        vm.toggleNotices = function() {
            vm.on = !vm.on;
        }

        // Popup a notice
        vm.popNotice = function(noticeObj) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(noticeObj.notice)
                    .position('top right')
                    .action('Luk')
            );
        };
        
        // Fake notifications while we wait for notification service -- REMOVE
        vm.notifications = [
            {id: 1, notice: 'Someone did something'},
            {id: 2, notice: 'You should do something', link: 'projekter'},
            {id: 3, notice: 'Check this out', desc: 'Someone did something and you should know about it'},
            {id: 4, notice: 'Something changed', desc: 'Someone did something, check it out', link: 'projekter'}
        ];
        vm.rmNotice = function(nIndex) {
            vm.notifications.splice(nIndex, 1);
        };
        vm.addNotice = function() {
            vm.popNotice({notice: 'Hey there'});
            vm.notifications.push({notice: 'Hey there'});
        };
        $timeout(vm.addNotice(), 3000);

    };
