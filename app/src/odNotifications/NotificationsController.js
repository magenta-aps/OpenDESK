
    angular
        .module('openDeskApp.notifications')
        .controller('NotificationsController', NotificationsController)
        .directive('odNotifications', function() {
            return {
              restrict: 'E',
              scope: false,
              templateUrl: '/app/src/odNotifications/view/notifications.html'
            };
        });

    function NotificationsController($scope, $timeout, $log, $mdToast, notificationsService, authService) {
        var vm = this;



        vm.notifications = new Array();
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
        
        notificationsService.getNotices(authService.getUserInfo().user.userName).then (function (val) {
            $scope.notifications = val;
        });


        vm.rmNotice = function(nIndex) {
            vm.notifications.splice(nIndex, 1);
        };

        vm.addNotice = function() {
            vm.popNotice({notice: 'Hey there'});
            vm.notifications.push({notice: 'Hey there'});
        };
        $timeout(vm.addNotice(), 3000);

    };
