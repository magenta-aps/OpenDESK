'use strict';

angular
    .module('openDeskApp.sites')
    .controller('SiteEditController', SiteEditController);

function SiteEditController(sitedata, $state, $scope, $mdDialog, pd_siteService, siteService, userService, $mdToast, filterService) {

    var pde = this;
    var availProjectOwners = [];
    var visibility = 'PUBLIC';

    pde.site = sitedata;

    $scope.groups.list.forEach(function (group) {
        switch (group[0].shortName) {
            case 'PD_PROJECTOWNER':
                $scope.owner = group[1][0];
                break;
            case 'PD_PROJECTMANAGER':
                $scope.manager = group[1][0];
                break;
        }
    });

    $scope.newSite = {
        shortName: pde.site.shortName,
        siteName: pde.site.title,
        desc: pde.site.description,
        owner: $scope.owner,
        sbsys: pde.site.sbsys,
        center_id: pde.site.center_id,
        manager: $scope.manager
    };

    if (pde.site.visibility === 'PRIVATE') {
        $scope.newSite.isPrivate = true;
    }
    $scope.newSite.availStates = [{
            stateId: 'ACTIVE',
            stateStr: 'Igang'
        },
        {
            stateId: 'CLOSED',
            stateStr: 'Afsluttet'
        }
    ];
    for (var s in $scope.newSite.availStates) {
        if (pde.site.state === $scope.newSite.availStates[s].stateId) {
            $scope.newSite.state = $scope.newSite.availStates[s];
        }
    }

    $scope.cancel = cancel;
    $scope.searchProjectOwners = searchProjectOwners;
    $scope.searchPeople = searchPeople;
    $scope.updatePdSite = updatePdSite;
    $scope.updateSite = updateSite;


    function cancel() {
        $mdDialog.cancel();
    }


    function getOwners() {
        pd_siteService.getAllOwners().then(
            function (response) {
                availProjectOwners = response;
            },
            function (err) {
                console.log(err);
            }
        );
    }
    getOwners();


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
        pd_siteService.getAllOrganizationalCenters().then(
            function (response) {
                $scope.availOrgs = response.data;
            }
        );
    }
    getAvailOrgs();


    function updatePdSite() {
        var manager = $scope.manager.userName;
        if ($scope.newSite.manager.userName !== undefined) {
            manager = $scope.newSite.manager.userName;
        }

        visibility = $scope.newSite.isPrivate ? 'PRIVATE' : 'PUBLIC';

        console.log('Updating site to sitename: ' + $scope.newSite.siteName +
            '; sbsys: ' + $scope.newSite.sbsys +
            '; center id: ' + $scope.newSite.center_id +
            '; owner: ' + $scope.newSite.owner.userName +
            '; manager: ' + manager +
            '; visibility: ' + visibility +
            '; state: ' + $scope.newSite.state.stateId
        );
        pd_siteService.updatePDSite(
            $scope.newSite.shortName,
            $scope.newSite.siteName,
            $scope.newSite.desc,
            $scope.newSite.sbsys,
            $scope.newSite.center_id,
            $scope.newSite.owner.userName,
            manager,
            visibility,
            $scope.newSite.state.stateId
        ).then(
            function (response) {
                if (response) {
                    $mdDialog.cancel();

                    $state.reload();

                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Du har opdateret: ' + $scope.newSite.siteName)
                        .hideDelay(3000)
                    );
                }
            },
            function (err) {
                console.log(err);
            }
        );
    }

    function updateSite() {
        console.log('update site');
        siteService.updateSite(
            $scope.newSite.shortName,
            $scope.newSite.siteName,
            $scope.newSite.desc,
            visibility
        ).then(
            function (response) {
                if (response) {
                    $mdDialog.cancel();

                    $state.reload();

                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Du har opdateret: ' + $scope.newSite.siteName)
                        .hideDelay(3000)
                    );
                }
            }
        );
    }

}