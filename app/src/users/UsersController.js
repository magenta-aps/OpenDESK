'use strict';

angular
    .module('openDeskApp.users')
    .controller('UsersController', UsersController);

function UsersController($scope, $mdDialog, userService) {

    var vm = this;

    vm.getPerson = function (name) {
        userService.getPerson(name).then(function (val) {
            vm.person = val;
        });
    };

    vm.getAllSystemUsers = function (query) {
        var filter = query ? query : "";
        return userService.getPeople(filter).then(function (response) {
            vm.allSystemUsers = response.people;
            return response;
        });
    }

};
        