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
                        
                        function grpSuccess(response, uName, grpName) {
                            createSiteNotification(siteName, uName, link);
                            console.log('Added user ' + uName + ' to ' + grpName);
                        }
                        
                        function grpErr(err, grpName) {
                            console.log('ERROR: Problem creating user in project group ' + grpName);
                            console.log(err);
                        }
                        
                        if(response.data[0].status === 'success') {
                            
                            var siteShortName = response.data[0].shortName;
                            var siteName = $scope.newSite.siteName;
                            var link = "/#!/projekter/" + siteShortName  + "?type=PD-Project";
                            
                            createSiteNotification(siteName, $scope.newSite.projectOwner.shortName, link);
                            createSiteNotification(siteName, $scope.newSite.manager.userName, link);
                            
                            
    
                            for (var up in $scope.projektGruppe) {
                                var puName = $scope.projektGruppe[up].userName;
                                siteService.addUser( $scope.newSite.siteName, puName, 'PD_PROJECTGROUP' ).then(
                                    grpSuccess(response, puName, 'PD_PROJECTGROUP'),
                                    grpErr(err, 'PD_PROJECTGROUP')
                                );
                            }
                            for (var us in $scope.styreGruppe) {
                                var suName = $scope.styreGruppe[us].userName;
                                siteService.addUser( $scope.newSite.siteName, suName, 'PD_STEERING_GROUP' ).then(
                                    grpSuccess(response, suName, 'PD_STEERING_GROUP'),
                                    grpErr(err, 'PD_STEERING_GROUP')
                                );
                            }
                            for (var ua in $scope.arbejdsGruppe) {
                                var auName = $scope.arbejdsGruppe[ua].userName;
                                siteService.addUser( $scope.newSite.siteName, auName, 'PD_WORKGROUP' ).then(
                                    grpSuccess(response, auName, 'PD_WORKGROUP'),
                                    grpErr(err, 'PD_WORKGROUP')
                                );
                            }
                            for (var uf in $scope.folgeGruppe) {
                                var fuName = $scope.folgeGruppe[uf].userName;
                                siteService.addUser( $scope.newSite.siteName, fuName, 'PD_MONITORS' ).then(
                                    grpSuccess(response, fuName, 'PD_MONITORS'),
                                    grpErr(err, 'PD_MONITORS')
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
