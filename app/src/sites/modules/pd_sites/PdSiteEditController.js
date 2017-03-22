'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteEditController', PdSiteEditController);
    
    function PdSiteEditController(sitedata, $scope, $mdDialog, pd_siteService, $state, $filter, siteService, $mdToast, filterService) {
        
        var pde = this;
        var availProjectOwners = [];
        var visibility = 'PUBLIC';
        
        pde.site = sitedata;
        
        //getProjectMembers();
        
        $scope.newSite = {
            shortName: pde.site.shortName,
            siteName: pde.site.title,
            desc: pde.site.description,
            owner: pde.site.groups['PD_PROJECTOWNER'].members[0],
            sbsys: pde.site.sbsys,
            center_id: pde.site.center_id,
            manager: pde.site.groups['PD_PROJECTMANAGER'].members[0]
        };
        //$scope.newSite.owner.fullName = pde.site.groups['PD_PROJECTOWNER'].displayName;
        //$scope.newSite.owner.shortName = pde.site.members.pd_projectowner.username;
        //$scope.newSite.manager.firstName = pde.site.members.pd_projectmanager.displayName;
        //$scope.newSite.manager.shortName = pde.site.members.pd_projectmanager.username;
        if (pde.site.visibility === 'PRIVATE') {
            $scope.newSite.isPrivate = true;
        }
        $scope.newSite.availStates = [
            { stateId: 'ACTIVE', stateStr: 'Igang'},
            { stateId: 'CLOSED', stateStr: 'Afsluttet'}
        ];
        for (var s in $scope.newSite.availStates) {
            if(pde.site.state === $scope.newSite.availStates[s].stateId) {
                $scope.newSite.state = $scope.newSite.availStates[s];
            }
        }
        console.log('$scope.newSite.state');
        console.log($scope.newSite.state);
        
        $scope.cancel = cancel;
        $scope.searchProjectOwners = searchProjectOwners;
        $scope.searchPeople = searchPeople;
        $scope.updatePdSite = updatePdSite;
        
        
        function cancel() {
            $mdDialog.cancel();
        }
        
        
        function getProjectOwners() {
            pd_siteService.getAllManagers().then(
                function(response) {
                    console.log('Got available project owners');
                    console.log(response);
                    availProjectOwners = response;
                },
                function(err) {
                    console.log(err);
                }
            );
        }
        getProjectOwners();
        
        
        function searchProjectOwners(query) {
            return filterService.search(availProjectOwners, { displayName: query });
        }
        
        
        function searchPeople(query) {
            if (query) {
                return siteService.getAllUsers(query);
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
            var manager = pde.site.groups['PD_PROJECTMANAGER'].members[0].userName;
            if ($scope.newSite.manager.userName !== undefined) {
                manager = $scope.newSite.manager.userName;
            }
            if ($scope.newSite.isPrivate === true) {
                visibility = 'PRIVATE';
            } else {
                visibility = 'PUBLIC';
            }
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
                function(response) {
                    if(response) {
                        $mdDialog.cancel();

                        $mdToast.show(
                            $mdToast.simple()
                                    .textContent('Du har opdateret projekt: ' + $scope.newSite.siteName)
                                    .hideDelay(3000)
                        );
                    }
                },
                function(err) {
                    console.log(err);
                }
            );
        }

    }
