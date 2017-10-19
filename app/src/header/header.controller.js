'use strict';

angular
    .module('openDeskApp.header')
    .controller('HeaderController', HeaderController);

function HeaderController($scope, $state, $mdSidenav, headerService, authService, notificationsService, userService) {
    var vm = this;

    vm.avatar = userService.getAvatarFromUser(authService.getUserInfo().user);
    vm.title = '';
    vm.toggleAppDrawer = buildToggler('appDrawer');
    vm.toggleNotifications = buildToggler('notifications');
    vm.toggleSystemSettings = toggleSystemSettings;
    vm.toggleUserPanel = buildToggler('userpanel');
    vm.unseenNotifications = 0;
    vm.user = authService.getUserInfo().user;

    $scope.headerService = headerService;
    $scope.notificationsService = notificationsService;

    $scope.$watch('headerService.getTitle()', function (newVal) {
        vm.title = newVal;
    });

    $scope.$watch('notificationsService.getUnseenCount()', function (newVal) {
        vm.unseenNotifications = newVal;
    });

    function toggleSystemSettings() {
        $state.go('systemsettings');
    }

    function buildToggler(navID) {
        return function () {
            $mdSidenav(navID).toggle();
        };
    }
}