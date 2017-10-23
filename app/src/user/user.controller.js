angular
    .module('openDeskApp.user')
    .controller('UserController', UserController)
    .directive('odUser', function () {
        return {
            scope: {},
            templateUrl: 'app/src/user/view/user.html',
            controller: 'UserController',
            controllerAs: 'vm'
        };
    });

function UserController($scope, $mdSidenav, authService, userService, sessionService, avatarUtilsService) {
    var vm = this;
    vm.receiveNotifications = "true";
    vm.user = authService.getUserInfo().user;

    vm.close = function () {
        $mdSidenav('userpanel').close();
    };

    function setNotificationPreferences() {
        var preferences = { "dk.magenta.sites.receiveNotifications" : vm.receiveNotifications };

        preferenceService.setPreferences(vm.user, preferences).then(function(data) {
            return data;
        });
    }
    vm.setNotificationPreferences = setNotificationPreferences;

    $scope.uploadAvatar = function(element) {
        var file = element.files[0];
        userService.uploadAvatar(file, vm.user.userName).then(function(data) {
            loadAvatar();
            return data;
        });
    };

    function loadAvatar() {
        userService.getPerson(vm.user.userName).then(function(user) {
            var avatar = avatarUtilsService.getAvatarFromUser(user);
            sessionService.setAvatar(avatar);
            vm.user.avatar = authService.getUserInfo().user.avatar;
        });
    }
}
