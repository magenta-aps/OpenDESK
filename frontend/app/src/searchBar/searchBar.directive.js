'use strict';

angular
.module('openDeskApp')
.directive('odSearchBar', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'app/src/searchBar/view/searchBar.html',
        controller: 'SearchBarController',
        controllerAs: 'vm'
    };
});