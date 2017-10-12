angular
    .module('openDeskApp.header')
    .controller('HeaderController', HeaderController);

function HeaderController($scope, $state, $mdSidenav, APP_CONFIG, headerService, authService, notificationsService, userService) {

    $scope.headerService = headerService;
    $scope.notificationsService = notificationsService;
    $scope.user = authService.getUserInfo().user;

    $scope.avatar = userService.getAvatarFromUser($scope.user);

    $scope.title = 'titel';
    $scope.unseenNotifications = 0;

    $scope.landingPageState = APP_CONFIG.landingPageState;

    $scope.$watch('headerService.getTitle()', function (newVal) {
        $scope.title = newVal;
    });

    $scope.$watch('notificationsService.getUnseenCount()', function (newVal) {
        $scope.unseenNotifications = newVal;
    });

    $scope.toggleSystemSettings = function () {
        $state.go('systemsettings');
    }

    $scope.gotoLandingPage = function () {
        $state.go($scope.landingPageState);
    }

    $scope.toggleNotifications = buildToggler('notifications');
    $scope.toggleUserPanel = buildToggler('userpanel');
    $scope.toggleAppDrawer = buildToggler('appDrawer');

    function buildToggler(navID) {
        return function () {
            $mdSidenav(navID).toggle();
        };
    }
}