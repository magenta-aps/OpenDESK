'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteCreateController', PdSiteCreateController);
    
    function PdSiteCreateController($mdDialog, pd_siteService, $state, $filter, siteService, $mdToast) {
        
        var pdc = this;
        
        pdc.openPdSiteCreateDialog = openPdSiteCreateDialog;
        
        //getProjectMembers();
        
        function openPdSiteCreateDialog(ev) {
            $mdDialog.show({
                controller: PdSiteCreateDiaglogController,
                templateUrl: 'app/src/sites/modules/pd_sites/view/pd_create_site_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }
        
        
        function PdSiteCreateDiaglogController($scope, notificationsService, authService) {

            var currentUser = authService.getUserInfo().user.userName;
            var availProjectOwners = [];
        
            $scope.cancel = cancel;
            
            $scope.newSite = {};
            $scope.availOrgs = [];
            $scope.projektGruppe = [];
            $scope.styreGruppe = [];
            $scope.arbejdsGruppe = [];
            $scope.folgeGruppe = [];
            $scope.selectedProjGrpItem = null;
            $scope.srchprjgrptxt = null;
            $scope.selectedStyreGrpItem = null;
            $scope.srchstrgrptxt = null;
            $scope.selectedArbejdsGrpItem = null;
            $scope.srchrbjdgrptxt = null;
            $scope.selectedFolgeGrpItem = null;
            $scope.srchflggrptxt = null;
            
            $scope.searchProjectOwners = searchProjectOwners;
            $scope.searchPeople = searchPeople;
            $scope.createPdSite = createPdSite;
            
            
            function cancel() {
                $mdDialog.cancel();
            }
            
            
            function getProjectOwners() {
                pd_siteService.getAllManagers().then(
                    function(response) {
                        console.log(response);
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
            
            
            function createPdSite() {
                console.log('creating new site with sitename: ' + $scope.newSite.siteName + '; sbsys: ' + $scope.newSite.sbsys + '; center id: ' + $scope.newSite.center_id + '; owner: ' + $scope.newSite.projectOwner.shortName + '; manager: '  + $scope.newSite.manager.userName);
                var shortName = $scope.newSite.siteName.replace(new RegExp(" ", 'g'), "-");
                var visibility = "PUBLIC"; // Visibility is set to public
                pd_siteService.createPDSite(
                    shortName,
                    $scope.newSite.siteName,
                    $scope.newSite.desc,
                    $scope.newSite.sbsys,
                    $scope.newSite.center_id,
                    $scope.newSite.projectOwner.shortName,
                    $scope.newSite.manager.userName,
                    visibility
                ).then(
                    function(response) {
                        if(response.data[0].status === 'success') {
                            
                            var siteShortName = response.data[0].shortName;
                            var siteName = $scope.newSite.siteName;
                            var link = "/#!/projekter/" + siteShortName  + "?type=PD-Project";
                            var userName;
                            
                            createSiteNotification(siteName, $scope.newSite.projectOwner.shortName, link);
                            createSiteNotification(siteName, $scope.newSite.manager.userName, link);
    
                            for (var up in $scope.projektGruppe) {
                                userName = $scope.projektGruppe[up].userName;
                                siteService.addUser( pdc.newSite.siteName, userName, 'PD_PROJECTGROUP' ).then(
                                    function(response) {
                                        createSiteNotification(siteName, userName, link);
                                        console.log('Added user ' + userName + ' to PD_PROJECTGROUP');
                                    },
                                    function(err) {
                                        console.log('ERROR: Problem creating user in project group PD_PROJECTGROUP');
                                        console.log(err);
                                    }
                                );
                            }
                            for (var us in $scope.styreGruppe) {
                                userName = $scope.projektGruppe[us].userName;
                                siteService.addUser( pdc.newSite.siteName, userName, 'PD_STEERING_GROUP' ).then(
                                    function(response) {
                                        createSiteNotification(siteName, userName, link);
                                        console.log('Added user ' + userName + ' to PD_STEERING_GROUP');
                                    },
                                    function(err) {
                                        console.log('ERROR: Problem creating user in project group PD_STEERING_GROUP');
                                        console.log(err);
                                    }
                                );
                            }
                            for (var ua in $scope.arbejdsGruppe) {
                                userName = $scope.projektGruppe[ua].userName;
                                siteService.addUser( pdc.newSite.siteName, userName, 'PD_WORKGROUP' ).then(
                                    function(response) {
                                        createSiteNotification(siteName, userName, link);
                                        console.log('Added user ' + userName + ' to PD_WORKGROUP');
                                    },
                                    function(err) {
                                        console.log('ERROR: Problem creating user in project group PD_WORKGROUP');
                                        console.log(err);
                                    }
                                );
                            }
                            for (var uf in $scope.folgeGruppe) {
                                userName = $scope.projektGruppe[uf].userName;
                                siteService.addUser( pdc.newSite.siteName, userName, 'PD_MONITORS' ).then(
                                    function(response) {
                                        createSiteNotification(siteName, userName, link);
                                        console.log('Added user ' + userName + ' to PD_MONITORS');
                                    },
                                    function(err) {
                                        console.log('ERROR: Problem creating user in project group PD_MONITORS');
                                        console.log(err);
                                    }
                                );
                            }
                            $mdDialog.cancel();
                            window.location.href = link;
    
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
            
            
            function createSiteNotification (siteName, userName, link) {
                if(userName !== currentUser) {
                    var subject = "Du er blevet tilføjet til " + siteName;
                    var message = "Du er blevet tilføjet til projektet " + siteName + ".";
                    notificationsService.addNotice(userName, subject, message, link).then(function (val) {
                        $mdDialog.cancel();
                    });
                }
            }
        
       
        }
        
        
    }
