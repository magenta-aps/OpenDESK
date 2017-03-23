'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteController', PdSiteController);
    
    function PdSiteController($q, $mdDialog, siteService, pd_siteService, groupService, $stateParams, authService,
                              alfrescoDownloadService) {

    
        var membersLoaded = false;
        var pd = this;
        
        pd.site = {};
        pd.editPdSite = editPdSite;
        pd.currentUser = authService.getUserInfo().user.userName;
        pd.showProjectMembers = showProjectMembers;
        pd.loadProjectMembers = loadProjectMembers;
		pd.removeMemberDialog = removeMemberDialog;
		pd.removeMemberFromSite = removeMemberFromSite;
		pd.updateMemberRoleDialog = updateMemberRoleDialog;
		pd.updateRoleOnSiteMember = updateRoleOnSiteMember;
        pd.doPDF = doPDF;
        pd.editPdSiteGroups = editPdSiteGroups;
		pd.stateStr = "";
		pd.visibilityStr = "";
		pd.hasDescription = false;

        pd.groups = [   'PD_PROJECTOWNER', 'PD_PROJECTMANAGER', 'PD_PROJECTGROUP',
                        'PD_WORKGROUP', 'PD_STEERING_GROUP', 'PD_MONITORS'];

        function loadSiteData() {
            if ($stateParams.projekt) {
                siteService.loadSiteData($stateParams.projekt).then(
                    function (response) {
                        pd.site = response;
						pd.stateStr = pd.site.state === "ACTIVE" ? "Igang" : "Afsluttet";
						pd.visibilityStr = pd.site.visibility === "PUBLIC" ? "Offentlig" : "Privat";
						pd.hasDescription = pd.site.description.trim() === "" ? false : true;
                        getProjectMembers();
                    }
                );
            }
        }
        loadSiteData();
        
        function loadProjectMembers(projectShortname, memberType) {
            pd.projectMembers = [];
            siteService.getGroupMembers(projectShortname, memberType).then (function (val){


                pd.projectMembers = val;
            });
        }
        
        
        function showProjectMembers(selected, projectShortname, memberType) {
            if (selected && !membersLoaded) {
                loadProjectMembers(projectShortname, memberType);
                membersLoaded = true;
            }
        }

        
        function doPDF() {
            siteService.createMembersPDF(pd.site.shortName).then(function(response) {
                alfrescoDownloadService.downloadFile("workspace/SpacesStore/" + response[0].Noderef, "Medlemsliste.pdf");

            });
        }
        
        
        function getProjectMembers() {
            pd.site.groups = {};

            // Creating an empty initial promise that always resolves itself.
            var promise = $q.all([]);

            // Iterating list of items.
            angular.forEach(pd.groups, function (groupName) {

                var siteShortName = pd.site.shortName;
                var groupShortName = pd_siteService.getPDGroupName(siteShortName, groupName);
                promise = groupService.getGroupMembers(groupShortName).then(
                    function (response) {
                        var groupFullName = pd_siteService.getPDGroupFullName(groupShortName);
                        var members = response;

                        pd.site.groups[groupName] = {};
                        pd.site.groups[groupName].members = members;
                        siteService.getMemberFromSite(siteShortName, groupFullName).then(
                            function (response) {
                                pd.site.groups[groupName].permissions = response.role;
                            }
                        );
                    }
                );
            });
        }
        
        
        function editPdSite(ev) {
            $mdDialog.show({
                controller: 'PdSiteEditController',
                templateUrl: 'app/src/sites/modules/pd_sites/view/pd_edit_site_dialog.html',
                locals: {
                    sitedata: pd.site
                },
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            }).finally(function() {
                loadSiteData();
            });
        }	
	
        
		function updateMemberRoleDialog(event, user) {
            vm.currentDialogUser = user;
            vm.currentDialogRole = user;
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

			var role_int_value = translation_to_value(role);
			var role_alfresco_value = $scope.role_mapping_reverse[role_int_value];

			siteService.updateRoleOnSiteMember(siteName, userName, role_alfresco_value ).then(function(val){
				getProjectMembers();
			});
			$mdDialog.hide();
		}
		
        
		function removeMemberDialog(member, group) {
            console.log(member);
            var confirm = $mdDialog.confirm()
                .title('Fjern '+member.displayName+'?')
                .textContent('')
                .ariaLabel('Fjern medlem')
                .targetEvent(event)
                .ok('Fjern')
                .cancel('Nej, tak');
            $mdDialog.show(confirm).then(function() {
                removeMemberFromSite(member, group);
            });
		}


		function removeMemberFromSite(member, group) {
			siteService.removeUser(pd.site.shortName, member.username, group).then( function(val) {
				getProjectMembers();
			});			
			$mdDialog.hide();
		}
        
        
        function editPdSiteGroups(ev) {
            $mdDialog.show({
                controller: 'PdSiteGroupEditController',
                templateUrl: 'app/src/sites/modules/pd_sites/view/pd_edit_groups_dialog.html',
                locals: {
                    sitedata: pd.site
                },
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            }).finally(function() {
                getProjectMembers();
            });
        }

        function openUserInfo() {
            console.log('show dialog now!');
        }

    
    }
