angular
.module('openDeskApp.appDrawer')
.directive('odAppDrawer', function () {
    return {
        scope: false,
        templateUrl: 'app/src/app-drawer/app-drawer.view.html',
        controller: 'AppDrawerController',
        controllerAs: 'vm'
    };
});