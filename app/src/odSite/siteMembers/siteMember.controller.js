'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteMemberController', SiteMemberController);

function SiteMemberController($scope, $mdDialog, siteService, alfrescoDownloadService, sessionService) {
    var vm = this;
    
    vm.doPDF = doPDF;
    vm.openMemberInfo = openMemberInfo;
    vm.loadMembers = loadMembers;
    vm.editSiteGroups = editSiteGroups;
    

    function doPDF() {
        siteService.createMembersPDF(vm.site.shortName).then(function (response) {
            alfrescoDownloadService.downloadFile("workspace/SpacesStore/" + response[0].Noderef, "Medlemsliste.pdf");
        });
    }

    function openMemberInfo(member, event) {
        var avatar = sessionService.makeAvatarUrl(member);
        $mdDialog.show({
            controller: ['$scope', 'member', function ($scope, member) {
                $scope.member = member;
                $scope.avatar = avatar;
            }],
            templateUrl: 'app/src/odSite/siteDetail/memberInfo.view.html',
            locals: {
                member: member
            },
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    function loadMembers() {
        siteService.getGroupsAndMembers().then(function (groups) {
            vm.groups = groups;
        });
    }

    function editSiteGroups(ev) {
        $mdDialog.show({
            templateUrl: 'app/src/odSite/editMembers/editMembers.tmpl.html',
            controller: 'EditSiteMemberController',
            controllerAs: 'vm',
            locals: {
                sitedata: vm.site
            },
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }
}