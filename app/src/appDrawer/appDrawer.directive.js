'use strict';

angular
.module('openDeskApp.appDrawer')
.directive('odAppDrawer', function () {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'app/src/appDrawer/appDrawer.view.html',
        controller: 'AppDrawerController',
        controllerAs: 'vm'
    };
});