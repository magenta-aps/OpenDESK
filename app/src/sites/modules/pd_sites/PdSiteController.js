'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteController', PdSiteController);
    
    function PdSiteController($mdDialog, siteService, pd_siteService, $stateParams, notificationsService, authService, $http, alfrescoDownloadService) {

    
        var membersLoaded = false;
        var pd = this;
        pd.editPdSite = editPdSite;
        pd.currentUser = authService.getUserInfo().user.userName;
        
        pd.showProjectMembers = showProjectMembers;
        pd.loadProjectMembers = loadProjectMembers;
		pd.removeMemberDialog = removeMemberDialog;
		pd.removeMemberFromSite = removeMemberFromSite;
		pd.updateMemberRoleDialog = updateMemberRoleDialog;
		pd.updateRoleOnSiteMember = updateRoleOnSiteMember;
        
        
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

        pd.doPDF = function() {
            siteService.createMembersPDF(pd.site.shortName).then(function(response) {
                alfrescoDownloadService.downloadFile("workspace/SpacesStore/" + response[0].Noderef, "Medlemsliste.pdf");

            });
        }
        
        
        if ($stateParams.projekt) {
            pd.site = { shortName: $stateParams.projekt };
            getProjectMembers();
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
                controller: PdSiteGroupEditController,
                templateUrl: 'app/src/sites/modules/pd_sites/view/pd_edit_groups_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }        
/*        
        function editPdSite(ev, site) {
            $mdDialog.show({
                controller: PdSiteEditController,
                locals: {
                    project: site
                },
                templateUrl: 'app/src/sites/modules/pd_sites/view/pd_edit_site_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }	
*/		
        
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
		};
		
        
		function removeMemberDialog(member, group) {
            var confirm = $mdDialog.confirm()
                .title('Slet dette medlem?')
                .textContent('')
                .ariaLabel('Slet medlem')
                .targetEvent(event)
                .ok('Slet')
                .cancel('Nej, tak');
            $mdDialog.show(confirm).then(function() {
                removeMemberFromSite(member, group);
            });
		};

        
		function removeMemberFromSite(member, group) {
			siteService.removeUser(pd.site.shortName, member.shortName, group).then(function(val){
				getProjectMembers();
			});			
			$mdDialog.hide();
		};
       
       
        function PdSiteEditController(project, $scope, $mdDialog, pd_siteService, $state, $filter, siteService, $mdToast) {
            
            
            var isEditMode = false;
            var availProjectOwners = [];
            $scope.newSite = {};
            $scope.availOrgs = [];
            $scope.projektGruppe = [];
            $scope.styreGruppe = [];
            $scope.arbejdsGruppe = [];
            $scope.folgeGruppe = [];
            
            // If project data is available, use edit mode
            if (project) {
                pd.site = project;
                isEditMode = true;
                getProjectMembers();
                console.log('project info:');
                console.log(project);
                $scope.newSite = {
                    siteName: pd.site.title,
                    desc: pd.site.description,
                    owner: pd.site.members.pd_projectowner,
                    sbsys: '',
                    center_id: pd.site.center_id,
                    manager: pd.site.members.pd_projectmanager
                };
                $scope.projektGruppe = pd.site.members.pd_projectgroup;
                $scope.styreGruppe = pd.site.members.pd_steering_group;
                $scope.arbejdsGruppe = pd.site.members.pd_workgroup;
                $scope.folgeGruppe = pd.site.members.pd_monitors;
            }
            
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
                pd_siteService.createPDSite(
                    $scope.newSite.siteName,
                    $scope.newSite.desc,
                    $scope.newSite.sbsys,
                    $scope.newSite.center_id,
                    $scope.newSite.owner.shortName,
                    $scope.newSite.manager.userName
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
        
    }
