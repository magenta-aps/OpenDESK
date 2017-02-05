'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteController', PdSiteController);
    
    function PdSiteController($mdDialog, siteService, pd_siteService) {

        var pd = this;
        var membersLoaded = false;
        
        // siteService.removeRole("kage2", "abeecher", "Consumer")

        // pd_siteService.createPDSite("kage4", "desc", "100", "center_1","fhp", "fhp");

        // pd_siteService.getAllOrganizationalCenters();

        // siteService.addUser("kage1", "abeecher", "PD_MONITORS");
        // siteService.removeUser("kage1", "abeecher", "PD_MONITORS");
        
        pd.newPDSite = newPDSite;
        pd.showProjectMembers = showProjectMembers;
        pd.loadProjectMembers = loadProjectMembers;
        
        
        function loadProjectMembers(projectShortname, memberType) {
            pd.projectMembers = [];
            siteService.getGroupMembers(projectShortname, memberType).then (function (val){
                pd.projectMembers = val;
                //console.log("member " + val.data[0].fullName);
            });
        }
        
        
        function showProjectMembers(selected, projectShortname, memberType) {
            if (selected && !membersLoaded) {
                loadProjectMembers(projectShortname, memberType);
                membersLoaded = true;
            }
        }
                   
        
        function newPDSite(ev) {
            $mdDialog.show({
                controller: PdSiteCreateController,
                templateUrl: 'app/src/sites/modules/pd_sites/view/pd_create_site_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }
        
        
        function PdSiteCreateController($scope, $mdDialog, pd_siteService, $state, $filter, siteService, $mdToast) {
            
            var availProjectOwners = [];
            $scope.newSite = {};
            $scope.availOrgs = [];
            
            $scope.selectedProjGrpItem = null;
            $scope.srchprjgrptxt = null;
            $scope.projektGruppe = [];
            
            $scope.selectedStyreGrpItem = null;
            $scope.srchstrgrptxt = null;
            $scope.styreGruppe = [];
            
            $scope.selectedArbejdsGrpItem = null;
            $scope.srchrbjdgrptxt = null;
            $scope.arbejdsGruppe = [];
            
            $scope.selectedFolgeGrpItem = null;
            $scope.srchflggrptxt = null;
            $scope.folgeGruppe = [];
            
            $scope.cancel = cancel;
            $scope.searchProjectOwners = searchProjectOwners;
            $scope.searchPeople = searchPeople;
            $scope.submitNewPDSite = submitNewPDSite;
            
            getProjectOwners();
            getAvailOrgs();
            
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
                        console.log('Got error retrieving project owners');
                        console.log(err);
                    }
                );
            }
            
            function searchProjectOwners(query) {
                var hitList = $filter('filter')(availProjectOwners, { fullName: query });
                return hitList;
            }
            
            function searchPeople(query) {
                console.log('searchPeople controller');
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
            
            function submitNewPDSite() {
                console.log('creating new site with sitename: ' + $scope.newSite.siteName + '; sbsys: ' + $scope.newSite.sbsys + '; center id: ' + $scope.newSite.center_id + '; owner: ' + $scope.newSite.owner.shortName + '; manager: '  + $scope.newSite.manager.userName);
                pd_siteService.createPDSite(
                    $scope.newSite.siteName,
                    $scope.newSite.desc,
                    $scope.newSite.sbsys,
                    $scope.newSite.center_id,
                    $scope.newSite.owner.shortName,
                    $scope.newSite.manager.userName
                ).then(
                    function(response) {
                        if(response.data[0].status === 'success') {
                            console.log('projectcreated');
                            console.log(response);
                            $mdDialog.cancel();
                            
                            for (var up in $scope.projektGruppe) {
                                siteService.addUser( $scope.newSite.siteName, $scope.projektGruppe[up].userName, 'PD_PROJECTGROUP' ).then(
                                    function(response) {
                                        console.log('Added user ' + $scope.projektGruppe[up].userName + ' to PD_PROJECTGROUP');
                                    },
                                    function(err) {
                                        console.log('ERROR: Problem creating user in project group PD_PROJECTGROUP');
                                        console.log(err);
                                    }
                                );
                            }
                            for (var us in $scope.styreGruppe) {
                                siteService.addUser( $scope.newSite.siteName, $scope.projektGruppe[us].userName, 'PD_STEERING_GROUP' ).then(
                                    function(response) {
                                        console.log('Added user ' + $scope.projektGruppe[us].userName + ' to PD_STEERING_GROUP');
                                    },
                                    function(err) {
                                        console.log('ERROR: Problem creating user in project group PD_STEERING_GROUP');
                                        console.log(err);
                                    }
                                );
                            }
                            for (var ua in $scope.arbejdsGruppe) {
                                siteService.addUser( $scope.newSite.siteName, $scope.projektGruppe[ua].userName, 'PD_WORKGROUP' ).then(
                                    function(response) {
                                        console.log('Added user ' + $scope.projektGruppe[ua].userName + ' to PD_WORKGROUP');
                                    },
                                    function(err) {
                                        console.log('ERROR: Problem creating user in project group PD_WORKGROUP');
                                        console.log(err);
                                    }
                                );
                            }
                            for (var uf in $scope.folgeGruppe) {
                                siteService.addUser( $scope.newSite.siteName, $scope.projektGruppe[uf].userName, 'PD_MONITORS' ).then(
                                    function(response) {
                                        console.log('Added user ' + $scope.projektGruppe[uf].userName + ' to PD_MONITORS');
                                    },
                                    function(err) {
                                        console.log('ERROR: Problem creating user in project group PD_MONITORS');
                                        console.log(err);
                                    }
                                );
                            }
                            
                            $mdToast.show(
                                $mdToast.simple()
                                        .textContent('Du har oprettet projekt: ' + $scope.newSite.siteName)
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
        

    }
