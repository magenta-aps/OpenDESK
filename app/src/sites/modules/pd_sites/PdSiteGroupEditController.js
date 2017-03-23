'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteGroupEditController', PdSiteGroupEditController);
    
    function PdSiteGroupEditController(sitedata, $scope, $mdDialog, siteService, $mdToast) {
        
        var pdg = this;
        
        pdg.site = sitedata;
        
        $scope.selectedProjGrpItem = null;
        $scope.srchprjgrptxt = null;
        $scope.projektGruppe = pdg.site.groups['PD_PROJECTGROUP'].members ? pdg.site.groups['PD_PROJECTGROUP'].members : [];
        
        $scope.selectedStyreGrpItem = null;
        $scope.srchstrgrptxt = null;
        $scope.styreGruppe = pdg.site.groups['PD_STEERING_GROUP'].members ? pdg.site.groups['PD_STEERING_GROUP'].members : [];
        
        $scope.selectedArbejdsGrpItem = null;
        $scope.srchrbjdgrptxt = null;
        $scope.arbejdsGruppe = pdg.site.groups['PD_WORKGROUP'].members ? pdg.site.groups['PD_WORKGROUP'].members : [];
        
        $scope.selectedFolgeGrpItem = null;
        $scope.srchflggrptxt = null;
        $scope.folgeGruppe = pdg.site.groups['PD_MONITORS'].members ? pdg.site.groups['PD_MONITORS'].members : [];
        
        $scope.cancel = cancel;
        $scope.updatePDSiteGroups = updatePDSiteGroups;
        $scope.searchPeople = searchPeople;
        $scope.addMember = addMember;
        $scope.removeMember = removeMember;
        $scope.addEksternToProjektGrp = addEksternToProjektGrp;
        $scope.addEksternToStyreGrp = addEksternToStyreGrp;
        $scope.addEksternToArbGrp = addEksternToArbGrp;
        $scope.addEksternToFlgGrp = addEksternToFlgGrp
        
        
        function addEksternToProjektGrp () {
            var eksternNavn = $scope.pgexternname;				
            var eksternEmail = $scope.pgexternemail;				
            var eksternMedlem = eksternNavn + " (" + eksternEmail + ")";
            $scope.projektGruppe.push({displayName: eksternMedlem});
        }
        
        
        function addEksternToStyreGrp () {
            var eksternNavn = $scope.stexternname;				
            var eksternEmail = $scope.stexternemail;				
            var eksternMedlem = eksternNavn + " (" + eksternEmail + ")";
            $scope.styreGruppe.push({displayName: eksternMedlem});
        }
        
        
        function addEksternToArbGrp () {
            var eksternNavn = $scope.arbexternname;				
            var eksternEmail = $scope.arbexternemail;				
            var eksternMedlem = eksternNavn + " (" + eksternEmail + ")";
            $scope.arbejdsGruppe.push({displayName: eksternMedlem});
        }
        
        
        function addEksternToFlgGrp () {
            var eksternNavn = $scope.flgexternname;				
            var eksternEmail = $scope.flgexternemail;				
            var eksternMedlem = eksternNavn + " (" + eksternEmail + ")";
            $scope.folgeGruppe.push({displayName: eksternMedlem});
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
