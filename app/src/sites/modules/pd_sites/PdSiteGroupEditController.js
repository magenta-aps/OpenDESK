'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteGroupEditController', PdSiteGroupEditController);
    
    function PdSiteGroupEditController($scope, $mdDialog, siteService, $mdToast) {
        
        $scope.selectedProjGrpItem = null;
        $scope.srchprjgrptxt = null;
        $scope.projektGruppe = pd.site.members.pd_projectgroup ? pd.site.members.pd_projectgroup : [];
        
        $scope.selectedStyreGrpItem = null;
        $scope.srchstrgrptxt = null;
        $scope.styreGruppe = pd.site.members.pd_steering_group ? pd.site.members.pd_steering_group : [];
        
        $scope.selectedArbejdsGrpItem = null;
        $scope.srchrbjdgrptxt = null;
        $scope.arbejdsGruppe = pd.site.members.pd_workgroup ? pd.site.members.pd_workgroup : [];
        
        $scope.selectedFolgeGrpItem = null;
        $scope.srchflggrptxt = null;
        $scope.folgeGruppe = pd.site.members.pd_monitors ? pd.site.members.pd_monitors : [];
        
        $scope.cancel = cancel;
        $scope.searchPeople = searchPeople;
        $scope.updatePDSiteGroups = updatePDSiteGroups;
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
            siteService.addUser( pd.site.shortName, member.userName, group ).then(
                function(response) {
                    console.log('Added user ' + member.userName + ' to ' + group);
                    getProjectMembers();
                },
                function(err) {
                    console.log('ERROR: Problem creating user ' + member.userName + ' in project group ' + group);
                    console.log(err);
                }
            );
        }
        
        function removeMember(member, group) {
            var u = member.shortName ? member.shortName : member.userName;
            siteService.removeUser( pd.site.shortName, u, group ).then(
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
            getProjectMembers();
            $mdToast.show(
                $mdToast.simple()
                        .textContent('Grupper er opdateret')
                        .hideDelay(3000)
            );
        }

        function updateMemberRoleDialog(event, user) {
            vm.currentDialogUser = user;
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/updateRole.tmpl.html',
                parent: angular.element(document.body),
                scope: $scope,
                preserveScope: true,
                targetEvent: event,
                clickOutsideToClose: true
            });
        }

        function updateRoleOnSiteMember(siteName, userName, role) {

            // getTheValue
            var role_int_value = translation_to_value(role);
            var role_alfresco_value = $scope.role_mapping_reverse[role_int_value];

            siteService.updateRoleOnSiteMember(siteName, userName, role_alfresco_value ).then(function(val){
                vm.loadMembers();
            });
            $mdDialog.hide();
        };

    }