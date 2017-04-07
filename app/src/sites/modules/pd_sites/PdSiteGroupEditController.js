'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteGroupEditController', PdSiteGroupEditController);
    
    function PdSiteGroupEditController(sitedata, $scope, $mdDialog, siteService, $mdToast, pd_siteService) {
        
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
                            .textContent('Brugeren kunne oprettes. Tjek at du ikke bruger nogle specielle karakterer i navnet')
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
                    console.log('Added user ' + member.userName + ' to ' + group);
                },
                function(err) {
                    console.log('ERROR: Problem creating user ' + member.userName + ' in project group ' + group);
                    console.log(err);
                }
            );
        }
        
        
        function removeMember(member, group) {
            siteService.removeUser( pdg.site.shortName, member.username, group ).then(
                function(response) {
                    console.log('Removed user ' + u + ' from ' + group);
                },
                function(err) {
                    console.log('ERROR: Problem removing user ' + u + ' from project group ' + group);
                    console.log(err);
                }
            );   
        }
        
        
        function updatePDSiteGroups() { 
            $mdDialog.cancel();
            $mdToast.show(
                $mdToast.simple()
                        .textContent('Grupper er opdateret')
                        .hideDelay(3000)
            );
        }

        
    }
