'use strict';

angular
    .module('openDeskApp')
    .directive('onlyOffice', function () {
        return {
            restrict: 'E',
            scope: {
                nodeRef: '=nodeRef'
            },
            templateUrl: 'app/src/onlyOffice/view/onlyOffice.html',
            controller: 'OnlyOfficePreviewController',
            controllerAs: 'vm'
        };
    });