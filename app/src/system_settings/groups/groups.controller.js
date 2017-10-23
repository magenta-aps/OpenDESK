angular
    .module('openDeskApp.systemsettings')
    .controller('SettingsGroupsController', SettingsGroupsController);

function SettingsGroupsController($scope, groupService, userService) {
    var vm = this;

    $scope.userService = userService;

    $scope.$watch(function () { return groupService.getOpenDeskGroups() }, function (newVal) {
        vm.groups = newVal;
    }, true);

    vm.openMemberInfo = groupService.openMemberInfo;
    vm.editMembers = groupService.editMembers;
}