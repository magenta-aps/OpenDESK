'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteGroupEditController', PdSiteGroupEditController);
    
    function PdSiteGroupEditController(sitedata, $scope, $mdDialog, siteService, $mdToast, pd_siteService, authService, notificationsService) {
        
        var pdg = this;
        
        pdg.site = sitedata;

        $scope.groups = [];
        
        $scope.selectedProjGrpItem = null;
        $scope.srchprjgrptxt = null;
        $scope.groups['PD_PROJECTGROUP'] = pdg.site.groups['PD_PROJECTGROUP'].members ? pdg.site.groups['PD_PROJECTGROUP'].members : [];
        
        $scope.selectedStyreGrpItem = null;
        $scope.srchstrgrptxt = null;
        $scope.groups['PD_STEERING_GROUP'] = pdg.site.groups['PD_STEERING_GROUP'].members ? pdg.site.groups['PD_STEERING_GROUP'].members : [];
        
        $scope.selectedArbejdsGrpItem = null;
        $scope.srchrbjdgrptxt = null;
        $scope.groups['PD_WORKGROUP'] = pdg.site.groups['PD_WORKGROUP'].members ? pdg.site.groups['PD_WORKGROUP'].members : [];
        
        $scope.selectedFolgeGrpItem = null;
        $scope.srchflggrptxt = null;
        $scope.groups['PD_MONITORS'] = pdg.site.groups['PD_MONITORS'].members ? pdg.site.groups['PD_MONITORS'].members : [];
        
        $scope.cancel = cancel;
        $scope.updatePDSiteGroups = updatePDSiteGroups;
        $scope.searchPeople = searchPeople;
        $scope.addMember = addMember;
        $scope.removeMember = removeMember;
        $scope.addExternalUserToGroup = addExternalUserToGroup;
        $scope.getFullName = getFullName;

        var user = authService.getUserInfo().user;
        var currentUser = user.userName;

        function addExternalUserToGroup (firstName, lastName, email, groupName) {
            pd_siteService.createExternalUser(pdg.site.shortName, firstName, lastName, email, groupName).then(
                function (response) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Den eksterne bruger, ' + firstName + " " + lastName + ', er blevet oprettet.')
                            .hideDelay(3000)
                    );
                    $scope.groups[groupName].push({firstName: firstName, lastName: lastName});
                },
                function (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Brugeren kunne ikke oprettes. Tjek at du ikke bruger nogle specielle karakterer i navnet')
                            .hideDelay(3000)
                    );
                });
        }
        
        function cancel() {
            $mdDialog.cancel();
        }
        
        
        function searchPeople(query) {
            if (query) {
                return siteService.getAllUsers(query);
            }
        }
        
        
        function addMember(member, group) {
            siteService.addUser( pdg.site.shortName, member.userName, group ).then(
                function(response) {
                    var link = "/#!/projekter/" + pdg.site.shortName;
                    createSiteNotification(pdg.site.title, member.userName, link);
                    console.log('Added user ' + member.userName + ' to ' + group + ' in project ');
                    console.log(pdg.site.title);
                },
                function(err) {
                    console.log('ERROR: Problem creating user ' + member.userName + ' in project group ' + group);
                    console.log(err);
                }
            );
        }
        
        
        function removeMember(member, group) {
            siteService.removeUser( pdg.site.shortName, member.userName, group ).then(

                function(response) {
                    console.log('Removed user ' + member.userName + ' from ' + group);
                },
                function(err) {
                    console.log('ERROR: Problem removing user ' + member.userName + ' from project group ' + group);
                    console.log(err);
                }
            );   
        }

        function getFullName(user) {
            console.log(user);
		    try {
			    return user.firstName + " " + user.lastName;
		    }
		    catch(err) {	}
	    }
        
        
        function updatePDSiteGroups() { 
            $mdDialog.cancel();
            $mdToast.show(
                $mdToast.simple()
                        .textContent('Grupper er opdateret')
                        .hideDelay(3000)
            );
        }

        function createSiteNotification (siteName, userName, link) {
            if (userName !== currentUser) {
                var subject = "Du er blevet tilføjet til " + siteName;
                var message = "har tilføjet dig til projektet " + siteName + ".";
                notificationsService.addNotice(userName, subject, message, link, 'project', siteName).then(function (val) {
                });
            }
        }
    }
