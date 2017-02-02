angular
    .module('openDeskApp.menu')
    .controller('MenuController', MenuController)
    .directive('odMenu', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/app/src/odMenu/view/menu.html'
        };
    });

function MenuController($scope, $log) {
    var vm = this;

};
