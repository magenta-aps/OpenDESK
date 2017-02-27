'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteEditController', PdSiteEditController);
    
    function PdSiteEditController(sitedata, $scope, $mdDialog, pd_siteService, $state, $filter, siteService, $mdToast) {
        
        var pde = this;
        var availProjectOwners = [];
        var visibility = 'PUBLIC';
        
        pde.site = sitedata;
        
        //getProjectMembers();
        console.log('pde.site.members.pd_projectmanager');
        console.log(pde.site.members.pd_projectmanager);
        
        $scope.newSite = {
            shortName: pde.site.shortName,
            siteName: pde.site.title,
            desc: pde.site.description,
            owner: pde.site.members.pd_projectowner,
            sbsys: pde.site.sbsys,
            center_id: pde.site.center_id,
            manager: pde.site.members.pd_projectmanager,
        };
        $scope.newSite.owner.fullName = pde.site.members.pd_projectowner.displayName;
        $scope.newSite.owner.shortName = pde.site.members.pd_projectowner.username;
        $scope.newSite.manager.firstName = pde.site.members.pd_projectmanager.displayName;
        $scope.newSite.manager.shortName = pde.site.members.pd_projectmanager.username;
        if (pde.site.visibility === 'PRIVATE') {
            $scope.newSite.isPrivate = true;
        }
        
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
                    console.log(response.data);
                    availProjectOwners = response.data;
                },
                function(err) {
                    console.log(err);
                }
            );
        }
        getProjectOwners();
        
        
        function searchProjectOwners(query) {
            var hitList = $filter('filter')(availProjectOwners, { fullName: query });
            return hitList;
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
            var manager = pde.site.members.pd_projectmanager.shortName;
            console.log('get some values:');
            console.log(pde.site.members.pd_projectmanager);
            if ($scope.newSite.manager.userName !== undefined) {
                manager = $scope.newSite.manager.userName;
            }
            if ($scope.newSite.isPrivate === true) {
                visibility = 'PRIVATE';
            } else {
                visibility = 'PUBLIC';
            }
            console.log('Updating site to sitename: ' + $scope.newSite.siteName + '; sbsys: ' + $scope.newSite.sbsys + '; center id: ' + $scope.newSite.center_id + '; owner: ' + $scope.newSite.owner.shortName + '; manager: '  + manager + '; visibility: ' + visibility);
            pd_siteService.updatePDSite(
                $scope.newSite.shortName,
                $scope.newSite.siteName,
                $scope.newSite.desc,
                $scope.newSite.sbsys,
                $scope.newSite.center_id,
                $scope.newSite.owner.shortName,
                manager,
                visibility,
                ''
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
