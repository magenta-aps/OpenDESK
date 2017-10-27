'use strict';

angular
.module('openDeskApp.filebrowser')
.directive('odFilebrowser', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'app/src/filebrowser//view/filebrowser.html',
        controller: 'FilebrowserController',
        controllerAs: 'vm'
    };
});