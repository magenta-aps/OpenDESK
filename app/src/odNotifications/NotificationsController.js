angular
    .module('openDeskApp.notifications')
    .controller('NotificationsController', NotificationsController)
    .directive('odNotifications', function () {
        return {
            restrict: 'E',
            scope: false,
            templateUrl: '/app/src/odNotifications/view/notifications.html'
        };
    });


function NotificationsController($scope, $timeout, $log, $mdToast, notificationsService, sessionService, $interval) {
    var vm = this;

    var userInfo = sessionService.getUserInfo();
    var currentUser = userInfo.user.userName;


    vm.notifications = new Array();
    vm.on = false;
    vm.toggleNotices = function () {
        vm.on = !vm.on;
    }

    // Popup a notice
    vm.popNotice = function (noticeObj) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(noticeObj.notice)
                .position('top right')
                .action('Luk')
        );
    };


    $interval(callAtTimeout, 10000);

    function callAtTimeout() {
        //console.log("Timeout occurred");
        vm.updateNotifications();
    }

    vm.updateNotifications = function updateNotifications() {
        notificationsService.getNotices(currentUser).then(function (val) {
            $scope.notifications = val;
        });
    }
    vm.updateNotifications();

    vm.rmNotice = function (nIndex) {
        notificationsService.delNotice(currentUser, nIndex).then(function () {

            vm.updateNotifications();
        });
    };

    vm.setRead = function (noticeObj) {
        console.log('set read');
        console.log(noticeObj);
        notificationsService.setReadNotice(currentUser, noticeObj).then(function (val) {
            vm.updateNotifications();
        });
    };

    vm.setSeen = function (noticeObj) {
        notificationsService.setSeenNotice(currentUser, noticeObj).then(function (val) {
            vm.updateNotifications();
        });
    };

    vm.setAllSeen = function () {
        notificationsService.setAllSeen(currentUser).then(function (val) {
            vm.updateNotifications();
        });
    };



};
