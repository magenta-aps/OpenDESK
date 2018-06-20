'use strict';

angular
  .module('openDeskApp.notifications')
  .controller('NotificationsController', NotificationsController);

function NotificationsController($mdSidenav, notificationsService, UserService) {
  var vm = this;
  
  var currentUser = UserService.get().userName;

  vm.notifications = [];
  vm.close = close;
  vm.setRead = setRead;
  vm.setSeen = setSeen;

  activate();

  function activate () {
    updateNotifications();
    notificationsService.startUpdate(updateNotifications);
  }

  function close () {
    $mdSidenav('notifications').close();
  }

  function setRead (noticeObj) {
    notificationsService.setReadNotice(currentUser, noticeObj)
    .then(function () {
      updateNotifications();
    });
  }

  function setSeen (noticeObj) {
    notificationsService.setSeenNotice(currentUser, noticeObj)
    .then(function () {
      updateNotifications();
    });
  }

  function updateNotifications () {
    notificationsService.get(currentUser)
    .then(function (notifications) {
      vm.notifications = notifications;
    });
  }
}
