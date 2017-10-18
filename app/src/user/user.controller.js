'use strict';

angular
    .module('openDeskApp.user')
    .controller('UserController', UserController);

function UserController($scope, $mdSidenav, userService, authService, preferenceService) {
    var vm = this;
    
    vm.close = close;
    vm.getAvatar = getAvatar;
    vm.receiveNotifications = "true";
    vm.setNotificationPreferences = setNotificationPreferences;
    vm.user = authService.getUserInfo().user;
    
    $scope.uploadAvatar = uploadAvatar;

    getAvatar();
    
    function close() {
        $mdSidenav('userpanel').close();
    }
    
    function getAvatar() {
        return userService.getAvatar(vm.user.userName).then(function (data) {
            vm.avatar = data;
        });
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
            getAvatar();
            return data;
        });
    }

}
