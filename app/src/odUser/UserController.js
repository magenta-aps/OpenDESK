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

    $scope.uploadAvatar = function(element) {
        var file = element.files[0];
        console.log('upload avatar');
        console.log(file);
        userService.uploadAvatar(file, vm.currentUser.userName).then(function(data) {
            getAvatar();
            return data;
        });
    }

    function getAvatar() {
        return userService.getAvatar(vm.currentUser.userName).then(function (data) {
            vm.avatar = data;
        });
    }
    vm.getAvatar = getAvatar;
};
