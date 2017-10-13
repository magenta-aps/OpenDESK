angular
    .module('openDeskApp.header')
    .controller('HeaderController', HeaderController);

function HeaderController($scope, $state, $mdSidenav, APP_CONFIG, headerService, authService, notificationsService, userService) {

    var vm = this;
    vm.user = authService.getUserInfo().user;
    vm.avatar = userService.getAvatarFromUser(vm.user);
    vm.title = '';
    vm.unseenNotifications = 0;

    $scope.headerService = headerService;
    $scope.notificationsService = notificationsService;

    var landingPageState = APP_CONFIG.landingPageState;

    $scope.$watch('headerService.getTitle()', function (newVal) {
        $scope.title = newVal;
    });

    $scope.$watch('notificationsService.getUnseenCount()', function (newVal) {
        $scope.unseenNotifications = newVal;
    });

    vm.toggleSystemSettings = function () {
        $state.go('systemsettings');
    }

    vm.gotoLandingPage = function () {
        $state.go(landingPageState);
    }

    vm.toggleNotifications = buildToggler('notifications');
    vm.toggleUserPanel = buildToggler('userpanel');
    vm.toggleAppDrawer = buildToggler('appDrawer');

    function buildToggler(navID) {
        return function () {
            $mdSidenav(navID).toggle();
        };
    }
}