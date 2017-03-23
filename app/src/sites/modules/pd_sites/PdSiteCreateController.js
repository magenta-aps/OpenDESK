'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteCreateController', PdSiteCreateController);
    
    function PdSiteCreateController($q, $mdDialog, pd_siteService, $state, filterService, siteService, $mdToast) {
        
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
            
            $scope.newSite = {
                isPrivate: false
            };
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

            function loadTemplateNames() {

                pd_siteService.getTemplateNames().then (function (response) {

                    var result = new Array();

                    for (var i in response) {

                        var shortName = response[i].shortName;
                        var displayName = response[i].title;
                        result.push({"shortName" : shortName, "displayName" : displayName})
                    }

                    $scope.templates = result;
                })

            }
           loadTemplateNames();

            
            function cancel() {
                $mdDialog.cancel();
            }
            
            
            function getProjectOwners() {
                pd_siteService.getAllManagers().then(
                    function(response) {
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
            
            
            function createPdSite() {
                if ($scope.newSite.template == undefined) {

                    $scope.newSite.template = {"name" : ""};

                }

                console.log('creating new site with sitename: ' + $scope.newSite.siteName + '; sbsys: ' + $scope.newSite.sbsys + '; center id: ' + $scope.newSite.center_id + '; owner: ' + $scope.newSite.projectOwner.shortName + '; manager: '  + $scope.newSite.manager.userName + " template: " + $scope.newSite.template.name);
                var visibility = "PUBLIC"; // Visibility is set to public
                if ($scope.newSite.isPrivate) {
                    visibility = "PRIVATE";
                }

                pd_siteService.createPDSite(
                    $scope.newSite.siteName,
                    $scope.newSite.desc,
                    $scope.newSite.sbsys,
                    $scope.newSite.center_id,
                    $scope.newSite.projectOwner.userName,
                    $scope.newSite.manager.userName,
                    visibility,
                    $scope.newSite.template.name
                ).then(
                    function(response) {
                        
                        if(response.data[0].status === 'success') {
                            
                            var siteShortName = response.data[0].shortName;
                            var siteName = $scope.newSite.siteName;
                            var link = "/#!/projekter/" + siteShortName;
                            
                            createSiteNotification(siteName, $scope.newSite.projectOwner.shortName, link);
                            createSiteNotification(siteName, $scope.newSite.manager.userName, link);

                            addUserToGroup(siteShortName, $scope.projektGruppe, 'PD_PROJECTGROUP', link);
                            addUserToGroup(siteShortName, $scope.styreGruppe, 'PD_STEERING_GROUP', link);
                            addUserToGroup(siteShortName, $scope.arbejdsGruppe, 'PD_WORKGROUP', link);
                            addUserToGroup(siteShortName, $scope.folgeGruppe, 'PD_MONITORS', link);

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

            function addUserToGroup(siteShortName, group, groupName, link) {
                // Creating an empty initial promise that always resolves itself.
                var promise = $q.all([]);

                // Iterating list of items sequential instead of async.
                angular.forEach(group, function (user) {
                    var userName = user.userName;
                    promise = siteService.addUser(siteShortName, userName, groupName).then(
                        function (response) {
                            createSiteNotification(siteShortName, userName, link);
                            console.log('Added user ' + userName + ' to ' + groupName);
                        },
                        function (err) {
                            console.log('ERROR: Problem creating user in project group ' + groupName);
                            console.log(err);
                        }
                    );
                });
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
