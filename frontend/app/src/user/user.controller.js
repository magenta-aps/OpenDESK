'use strict';

angular
    .module('openDeskApp.user')
    .controller('UserController', UserController);

function UserController($scope, $mdSidenav, UserService, MemberService, sessionService, preferenceService) {
  var vm = this;
  
  vm.close = close;
  vm.loadAvatar = loadAvatar;
  vm.receiveNotifications = "true";
  vm.setNotificationPreferences = setNotificationPreferences;
  vm.user = UserService.get();
  
  $scope.uploadAvatar = uploadAvatar;

  loadAvatar();
  
  function close() {
    $mdSidenav('userpanel').close();
  }

  function setNotificationPreferences() {
    var preferences = { "dk.magenta.sites.receiveNotifications" : vm.receiveNotifications };

    preferenceService.setPreferences(vm.user, preferences)
    .then(function(data) {
      return data;
    });
  }

  function uploadAvatar(element) {
    var file = element.files[0];
    UserService.uploadAvatar(file)
    .then(function(data) {
      loadAvatar();
      return data;
    });
  }

  function loadAvatar() {
    MemberService.get(vm.user.userName)
    .then(function(user) {
      sessionService.setAndSaveAvatarToUserInfo(user);
      vm.user.avatar = sessionService.updateAvatar(user);
    });
  }
}
