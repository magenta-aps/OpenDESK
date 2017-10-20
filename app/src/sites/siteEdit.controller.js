'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteEditController', SiteEditController);

function SiteEditController(sitedata, $state, $scope, $mdDialog, siteService, userService, $mdToast, filterService) {

    var vm = this;
    var availProjectOwners = [];

    vm.site = sitedata;
    vm.newSite = vm.site;
    vm.cancelDialog = cancelDialog;
    vm.searchProjectOwners = searchProjectOwners;
    vm.searchPeople = searchPeople;
    vm.updateSite = updateSite;

    // vm.availStates = [{
    //     stateId: 'ACTIVE',
    // },
    // {
    //     stateId: 'CLOSED',
    // }
    // ];

    vm.availStates = ['ACTIVE','CLOSED'];

    activate();

    function activate() {
        console.log(vm.newSite);
        siteService.getSiteOwner().then(function (owner) {
            vm.newSite.owner = owner;
        });

        siteService.getSiteManager().then(function (manager) {
            vm.newSite.manager = manager;
        });

        vm.newSite.isPrivate = (vm.site.visibility === 'PRIVATE' ? true : false);

        getOwners();
        getAvailOrgs();
    }

    function cancelDialog() {
        $mdDialog.cancel();
    }

    function getOwners() {
        siteService.getAllOwners().then(function (response) {
            availProjectOwners = response;
        },function (err) {
            console.log(err);
        });
    }

    function searchProjectOwners(query) {
        return filterService.search(availProjectOwners, {
            displayName: query
        });
    }

    function searchPeople(query) {
        if (query) {
            return userService.getUsers(query);
        }
    }

    function getAvailOrgs() {
        siteService.getAllOrganizationalCenters().then(function (response) {
            $scope.availOrgs = response.data;
        });
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