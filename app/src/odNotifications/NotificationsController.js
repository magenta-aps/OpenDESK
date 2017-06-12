angular
    .module('openDeskApp.notifications')
    .controller('NotificationsController', NotificationsController)
    .directive('odNotifications', function () {
        return {
            restrict: 'E',
            scope: false,
            templateUrl: 'app/src/odNotifications/view/notifications.html'
        };
    });


function NotificationsController($scope, $mdToast, notificationsService, sessionService) {
    var vm = this;

    var userInfo = sessionService.getUserInfo();
    var currentUser = userInfo.user.userName;


    vm.notifications = [];
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

    vm.rmNotice = function (nIndex) {
        notificationsService.delNotice(currentUser, nIndex).then(function () {

            updateNotifications();
        });
    };

    vm.setRead = function (noticeObj) {
        notificationsService.setReadNotice(currentUser, noticeObj).then(function (val) {
            updateNotifications();
        });
    };

    vm.setSeen = function (noticeObj) {
        notificationsService.setSeenNotice(currentUser, noticeObj).then(function (val) {
            updateNotifications();
        });
    };

    vm.setAllSeen = function () {
        notificationsService.setAllSeen(currentUser).then(function (val) {
            updateNotifications();
        });
    };

    function updateNotifications() {
        notificationsService.getNotices(currentUser).then(function (val) {
            $scope.notifications = val;
        });
    }

    notificationsService.startUpdate(updateNotifications);

};
