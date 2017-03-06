angular
    .module('openDeskApp.user')
    .controller('UserController', UserController)
    .directive('odUser', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/app/src/odUser/view/user.html'
        };
    });

function UserController($scope, $log) {
    var vm = this;

    vm.on = false;
    vm.toggleUser = function () {
        vm.on = !vm.on;
    }

};
