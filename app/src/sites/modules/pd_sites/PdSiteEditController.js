'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteEditController', PdSiteEditController);
    
    function PdSiteEditController(sitedata, $scope, $mdDialog, pd_siteService, $state, $filter, siteService, $mdToast) {
        
        var pde = this;
        var availProjectOwners = [];
        
        pde.site = sitedata;
        
        $scope.newSite = {};
        $scope.availOrgs = [];
        $scope.projektGruppe = [];
        $scope.styreGruppe = [];
        $scope.arbejdsGruppe = [];
        $scope.folgeGruppe = [];
        
        //getProjectMembers();
        
        $scope.newSite = {
            siteName: pde.site.title,
            desc: pde.site.description,
            owner: pde.site.members.pd_projectowner,
            sbsys: '',
            center_id: pde.site.center_id,
            manager: pde.site.members.pd_projectmanager
        };
        $scope.projektGruppe = pde.site.members.pd_projectgroup;
        $scope.styreGruppe = pde.site.members.pd_steering_group;
        $scope.arbejdsGruppe = pde.site.members.pd_workgroup;
        $scope.folgeGruppe = pde.site.members.pd_monitors;
        
        $scope.selectedProjGrpItem = null;
        $scope.srchprjgrptxt = null;
        $scope.selectedStyreGrpItem = null;
        $scope.srchstrgrptxt = null;
        $scope.selectedArbejdsGrpItem = null;
        $scope.srchrbjdgrptxt = null;
        $scope.selectedFolgeGrpItem = null;
        $scope.srchflggrptxt = null;
        
        $scope.cancel = cancel;
        $scope.searchProjectOwners = searchProjectOwners;
        $scope.searchPeople = searchPeople;
        $scope.updatePdSite = updatePdSite;
        
        
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

        
        function createSiteNotification (siteName, userName, link) {
                if(userName == pd.currentUser)
                    return;

                var subject = "Du er blevet tilføjet til " + siteName;
                var message = "Du er blevet tilføjet til projektet " + siteName + ".";
                notificationsService.addNotice(userName, subject, message, link).then(function (val) {
                    $mdDialog.hide();
                });
        }
        
        
        function updatePdSite() {
            console.log('creating new site with sitename: ' + $scope.newSite.siteName + '; sbsys: ' + $scope.newSite.sbsys + '; center id: ' + $scope.newSite.center_id + '; owner: ' + $scope.newSite.owner.shortName + '; manager: '  + $scope.newSite.manager.userName);
            var shortName = $scope.newSite.siteName.replace(new RegExp(" ", 'g'), "-");
            var visibility = "PUBLIC"; // Visibility is set to public
            pd_siteService.createPDSite(
                shortName,
                $scope.newSite.siteName,
                $scope.newSite.desc,
                $scope.newSite.sbsys,
                $scope.newSite.center_id,
                $scope.newSite.owner.shortName,
                $scope.newSite.manager.userName,
                visibility
            ).then(
                function(response) {
                    if(response.data[0].status === 'success') {
                        $mdDialog.cancel();

                        var siteShortName = response.data[0].shortName;
                        var siteName = $scope.newSite.siteName;
                        var link = "/#!/projekter/" + siteShortName  + "?type=PD-Project";
                        var userName;
                        createSiteNotification(siteName, $scope.newSite.owner.shortName, link);
                        createSiteNotification(siteName, $scope.newSite.manager.userName, link);

                        for (var up in $scope.projektGruppe) {
                            userName = $scope.projektGruppe[up].userName;
                            siteService.addUser( $scope.newSite.siteName, userName, 'PD_PROJECTGROUP' ).then(
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
                            siteService.addUser( $scope.newSite.siteName, userName, 'PD_STEERING_GROUP' ).then(
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
                            siteService.addUser( $scope.newSite.siteName, userName, 'PD_WORKGROUP' ).then(
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
                            siteService.addUser( $scope.newSite.siteName, userName, 'PD_MONITORS' ).then(
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

    }
