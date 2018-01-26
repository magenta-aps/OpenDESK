'use strict';

angular
    .module('openDeskApp')
    .directive('nodePicker', function () {
        return {
            restrict: 'E',
            scope: {
                currentNodeRef: '=root',
                model: '=model'
            },
            templateUrl: 'app/src/shared/directives/nodePicker/nodePicker.view.html',
            controller: 'NodePickerController',
            controllerAs: 'vm'
        };
    });