'use strict';

angular
    .module('openDeskApp.header')
    .controller('HeaderController', HeaderController);

function HeaderController($scope, $state, $mdSidenav, headerService, authService, notificationsService) {
    var vm = this;

    vm.title = '';
    vm.toggleAppDrawer = buildToggler('appDrawer');
    vm.toggleNotifications = function() {
        setAllSeen();
        $mdSidenav('notifications').toggle();
    };
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

    function setAllSeen() {
        notificationsService.setAllSeen(vm.user.userName).then(function () {
            updateNotifications();
        });
    }

    function updateNotifications() {
        notificationsService.get(vm.user.userName);
    }
}