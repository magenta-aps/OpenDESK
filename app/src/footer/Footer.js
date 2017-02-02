angular
    .module('openDeskApp')
    .directive('appFooter', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'app/src/footer/view/footer.html'
        };
    });