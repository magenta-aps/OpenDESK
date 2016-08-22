
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
        
        // Fake notifications while we wait for notification service -- REMOVE

        notificationsService.getNotices(authService.getUserInfo().user.userName).then (function (val) {
            vm.notifications = val;
            console.log(val);
        });


        //test of the wf call
        //notificationsService.addWFNotice(authService.getUserInfo().user.userName, "admin", "titel", "emne", "022f4f48-d3f6-4ea0-8d08-463ce3aa6179").then (function (val) {
        //    console.log(val);
        //});

        notificationsService.setReadNotice("admin", "workspace://SpacesStore/fe5598f8-a3fe-4834-9712-5f1aba8f7f1f")




        vm.rmNotice = function(nIndex) {
            vm.notifications.splice(nIndex, 1);
        };

        vm.addNotice = function() {
            vm.popNotice({notice: 'Hey there'});
            vm.notifications.push({notice: 'Hey there'});
        };
        $timeout(vm.addNotice(), 3000);

    };
