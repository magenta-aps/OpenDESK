'use strict';

angular
    .module('openDeskApp')
    .directive('onlyOffice', function () {
        return {
            restrict: 'E',
            scope: {},
            controller: 'OnlyOfficePreviewController',
            controllerAs: 'vm'
        };
    });