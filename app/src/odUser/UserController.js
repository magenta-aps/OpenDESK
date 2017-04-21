angular
    .module('openDeskApp.user')
    .controller('UserController', UserController)
    .directive('odUser', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'app/src/odUser/view/user.html'
        };
    });

function UserController($scope, $log, authService, userService, sessionService) {
    var vm = this;
    vm.receiveNotifications = "true";
    vm.currentUser = authService.getUserInfo().user;
    getAvatar();

    vm.on = false;
    vm.toggleUser = function () {
        vm.on = !vm.on;
    }

    function setNotificationPreferences() {
        var preferences = { "dk.magenta.sites.receiveNotifications" : vm.receiveNotifications };

        preferenceService.setPreferences(vm.currentUser, preferences).then(function(data) {
            return data;
        });
    }
    vm.setNotificationPreferences = setNotificationPreferences;

    function uploadAvatar(file) {
        userService.uploadAvatar(file, vm.currentUser.userName).then(function(data) {
            getAvatar();
            return data;
        });
    }
    vm.uploadAvatar = uploadAvatar;

    function getPerson() {
        userService.getPerson(vm.currentUser.userName).then(function(data) {
            return data;
        });
    }
    vm.getPerson = getPerson;

    function getAvatar() {
        userService.getPerson(vm.currentUser.userName).then(function (data) {
            var avatar = data.avatar.replace("/thumbnails/avatar", "");
            vm.avatar = sessionService.makeURL("/alfresco/s/" + avatar + vm.currentUser.userName);
        });
    }

};
