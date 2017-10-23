'use strict';

angular
    .module('openDeskApp.notifications')
    .controller('NotificationsController', NotificationsController);


function NotificationsController($scope, $mdToast, $mdSidenav, notificationsService, sessionService) {

var vm = this;

var userInfo = sessionService.getUserInfo();
var currentUser = userInfo.user.userName;

vm.notifications = [];
vm.close = close;
vm.setRead = setRead;
vm.setSeen = setSeen;
vm.setAllSeen = setAllSeen;

activate();

function activate() {
    updateNotifications();
    notificationsService.startUpdate(updateNotifications);
}

function close() {
    $mdSidenav('notifications').close();
}

function setRead(noticeObj) {
    notificationsService.setReadNotice(currentUser, noticeObj).then(function (val) {
        updateNotifications();
    });
}

function setSeen(noticeObj) {
    notificationsService.setSeenNotice(currentUser, noticeObj).then(function (val) {
        updateNotifications();
    });
}

function setAllSeen() {
    notificationsService.setAllSeen(currentUser).then(function (val) {
        updateNotifications();
    });
}

function updateNotifications() {
    notificationsService.getNotifications(currentUser).then(function (notifications) {
        vm.notifications = notifications;
    });
}
}