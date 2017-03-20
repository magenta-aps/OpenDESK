angular
    .module('openDeskApp.user')
    .controller('UserController', UserController)
    .directive('odUser', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/app/src/odUser/view/user.html'
        };
    });

function UserController($scope, $log) {
    var vm = this;
    vm.receiveNotifications = "true";

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

};
