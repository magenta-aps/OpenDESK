'use strict';

angular
    .module('openDeskApp.group')
    .controller('GroupController', GroupController);

function GroupController($mdDialog, $mdToast, $translate, group, groupService, MemberService, sessionService) {

    var vm = this;
    vm.group = group;

    vm.cancelDialog = cancelDialog;
    vm.updateMembers = updateMembers;
    vm.search = search;
    vm.addMember = addMember;
    vm.removeMember = removeMember;
    vm.getMemberShortName = getMemberShortName;

    function cancelDialog () {
        $mdDialog.cancel();
    }

    function updateMembers() {
        cancelDialog();
        $translate('MEMBER.MEMBERS_UPDATED')
        .then(function (msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .hideDelay(3000)
            );
        });
    }

    function search(query) {
        if (query) {
            switch(vm.group.type){
                case 'USER':
                    return MemberService.search(query);
                case 'GROUP':
                    return groupService.getGroups(query);
            }
        }
    }

    function addMember(member, groupName) {
        var shortName = getMemberShortName(member);
        groupService.addMember(shortName, groupName).then(function () {
            member.avatar = sessionService.makeAvatarUrl(member);
            vm.groups.push(member);
        });
    }

    function removeMember(member, groupName) {
        var shortName = getMemberShortName(member);
        groupService.removeMember(shortName, groupName);
    }

    function getMemberShortName(member) {
        if (member.userName)
            return member.userName;
        else if (member.fullName)
            return member.fullName;
        else return '';
    }
}