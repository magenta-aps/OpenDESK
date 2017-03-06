'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteController', PdSiteController);
    
    function PdSiteController($mdDialog, siteService, pd_siteService, $stateParams, notificationsService, authService, $http, alfrescoDownloadService) {

    
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

        function loadSiteData() {
            if ($stateParams.projekt) {
                siteService.loadSiteData($stateParams.projekt).then(
                    function (response) {
                        pd.site = response;
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
            pd.site.members = {};
            siteService.getGroupMembers(pd.site.shortName, 'PD_PROJECTOWNER').then(
                function(response) {
                    pd.site.members.pd_projectowner = response[1][0];
                }
            );
			siteService.getGroupMembers(pd.site.shortName, 'PD_PROJECTMANAGER').then(
                function(response) {
                    pd.site.members.pd_projectmanager = response[1][0];
                }
            );
			siteService.getGroupMembers(pd.site.shortName, 'PD_PROJECTGROUP').then(
                function(response) {
                    pd.site.members.pd_projectgroup = response[1];
					pd.site.members.pd_projectgroup_permission = response[0].permission;
                }
            );
            siteService.getGroupMembers(pd.site.shortName, 'PD_WORKGROUP').then(
                function(response) {
                    pd.site.members.pd_workgroup = response[1];
					pd.site.members.pd_workgroup_permission = response[0].permission;
                }
            );
            siteService.getGroupMembers(pd.site.shortName, 'PD_STEERING_GROUP').then(
                function(response) {
                    pd.site.members.pd_steering_group = response[1];
					pd.site.members.pd_steering_group_permission = response[0].permission;
                }
            );
            siteService.getGroupMembers(pd.site.shortName, 'PD_MONITORS').then(
                function(response) {
                    pd.site.members.pd_monitors = response[1];
					pd.site.members.pd_monitors_permission = response[0].permission;
                }
            );
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
			vm.currentDialogUser = user.fullName;				
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
            var confirm = $mdDialog.confirm()
                .title('Fjern dette medlem?')
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

    
    }
