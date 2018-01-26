'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteEditController', SiteEditController);

function SiteEditController(sitedata, $state, $scope, $mdDialog, siteService, userService, $mdToast, filterService,
                            groupService) {

    var vm = this;

    vm.availStates = ['ACTIVE','CLOSED'];
    vm.availOrgs = [];
    vm.cancelDialog = cancelDialog;
    vm.newSite = sitedata;
    vm.site = sitedata;
    vm.updateSite = updateSite;

    activate();

    function activate() {
        siteService.getSiteOwner().then(function (owner) {
            vm.newSite.owner = owner;
        });

        siteService.getSiteManager().then(function (manager) {
            vm.newSite.manager = manager;
        });

        siteService.getAllOrganizationalCenters().then(function (response) {
            vm.availOrgs = response.data;
        });

        vm.newSite.isPrivate = (vm.site.visibility === 'PRIVATE' ? true : false);
    }

    function cancelDialog() {
        $mdDialog.cancel();
    }

    function updatePdSite() {
        siteService.updatePDSite(vm.newSite).then(function (response) {
            $mdDialog.cancel();
            $state.reload();
            $mdToast.show(
                $mdToast.simple()
                .textContent('Du har opdateret: ' + vm.newSite.title)
                .hideDelay(3000)
            );
        },function (err) {
            console.log(err);
        });
    }

    function updateSite() {
        vm.newSite.visibility = vm.newSite.isPrivate ? 'PRIVATE' : 'PUBLIC';

        if(vm.site.type == 'PD-Project') {
            updatePdSite();
            return;
        }

        siteService.updateSite(vm.newSite).then(function (response) {
            $mdDialog.cancel();
            $state.reload();
            $mdToast.show(
                $mdToast.simple()
                .textContent('Du har opdateret: ' + vm.newSite.siteName)
                .hideDelay(3000)
            );
        });
    }

}