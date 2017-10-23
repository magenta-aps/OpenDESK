'use strict';

angular
    .module('openDeskApp.user')
    .controller('UserController', UserController);

function UserController($scope, $mdSidenav, authService, userService, sessionService, preferenceService, avatarUtilsService) {
    var vm = this;
    
    vm.close = close;
    vm.loadAvatar = loadAvatar;
    vm.receiveNotifications = "true";
    vm.setNotificationPreferences = setNotificationPreferences;
    vm.user = authService.getUserInfo().user;
    
    $scope.uploadAvatar = uploadAvatar;

    loadAvatar();
    
    function close() {
        $mdSidenav('userpanel').close();
    }

    function setNotificationPreferences() {
        var preferences = { "dk.magenta.sites.receiveNotifications" : vm.receiveNotifications };

        preferenceService.setPreferences(vm.user, preferences).then(function(data) {
            return data;
        });
    }

    function uploadAvatar(element) {
        var file = element.files[0];
        userService.uploadAvatar(file, vm.user.userName).then(function(data) {
            loadAvatar();
            return data;
        });
    }

    function loadAvatar() {
        userService.getPerson(vm.user.userName).then(function(user) {
            var avatar = avatarUtilsService.getAvatarFromUser(user);
            sessionService.setAvatar(avatar);
            vm.user.avatar = authService.getUserInfo().user.avatar;
        });
    }
}
