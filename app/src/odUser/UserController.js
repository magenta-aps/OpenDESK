angular
    .module('openDeskApp.user')
    .controller('UserController', UserController)
    .directive('odUser', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'app/src/odUser/view/user.html',
            controller: 'UserController',
            controllerAs: 'vm'
        };
    });

function UserController($scope, $log, $mdSidenav, authService, userService, sessionService) {
    var vm = this;
    vm.receiveNotifications = "true";
    vm.user = authService.getUserInfo().user;
    getAvatar();

    vm.close = function () {
        $mdSidenav('userpanel').close();
    }

    function setNotificationPreferences() {
        var preferences = { "dk.magenta.sites.receiveNotifications" : vm.receiveNotifications };

        preferenceService.setPreferences(vm.user, preferences).then(function(data) {
            return data;
        });
    }
    vm.setNotificationPreferences = setNotificationPreferences;

    $scope.uploadAvatar = function(element) {
        var file = element.files[0];
        console.log('upload avatar');
        console.log(file);
        userService.uploadAvatar(file, vm.user.userName).then(function(data) {
            getAvatar();
            return data;
        });
    }

    function getAvatar() {
        return userService.getAvatar(vm.user.userName).then(function (data) {
            vm.avatar = data;
        });
    }
    vm.getAvatar = getAvatar;
};
