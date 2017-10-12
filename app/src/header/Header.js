angular
    .module('openDeskApp.header')
    .directive('appHeader', HeaderDirective);

function HeaderDirective() {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'app/src/header/view/header.html'
    };
};
    