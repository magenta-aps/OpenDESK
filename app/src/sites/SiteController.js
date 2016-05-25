'use strict';

    angular
        .module('openDeskApp.sites')
        .controller('SiteController', SiteController);
        
        function SiteController($scope, $mdDialog, $window, siteService, cmisService, $stateParams, $location) {

			var vm = this;
			$scope.contents = [];
			$scope.members = [];

			vm.project = $stateParams.projekt;
			vm.path = $stateParams.path;
			vm.breadCrumb = [{slug: vm.project, link: '/'}];
			
			vm.upDateBreadCrumb = function() {
				var bc = '';
				vm.path.split('/').forEach(function(val) {
					if (val != '') {
						bc = bc + '/' + val;
                        vm.breadCrumb.push({slug: val, link: bc});
                    };
				});
			};
			
			vm.cancel = function () {
				$mdDialog.cancel();
			};

			vm.reload = function () {
				$window.location.reload();
			};

			vm.deleteSite = function (project) {
				 var confirm = $mdDialog.confirm()
					.clickOutsideToClose(true)
					.title('Vil du slette dette projekt?')
					.textContent('Projektet og alle dets filer vil blive fjernet')
					.ok('Slet')
					.cancel('Annullér');
				$mdDialog.show(confirm).then(function() {
					siteService.deleteSite(project);
					$window.location.reload();
					$window.location.href = '#/projekter';
				});
			}

			vm.createFolder = function (folderName) {
				var currentFolderNodeRef;
				var cmisQuery = $stateParams.projekt + $stateParams.path;

				cmisService.getNode(cmisQuery).then(function (val) {
					currentFolderNodeRef = val.data.properties["alfcmis:nodeRef"].value;

					var props = {
						prop_cm_name: folderName,
						prop_cm_title: folderName,
						alf_destination: currentFolderNodeRef
					};

					siteService.createFolder("cm:folder", props);

					vm.reload();
				});
			}


			vm.newFolderDialog = function (event) {
				$mdDialog.show({
					templateUrl: 'app/src/sites/view/newFolder.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
					clickOutsideToClose: true
				});
			};


			vm.deleteFileDialog = function (event) {
				$mdDialog.show({
					templateUrl: 'app/src/sites/view/deleteFile.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
					clickOutsideToClose: true
				});
			}

			vm.uploadDocumentsDialog = function (event) {
				$mdDialog.show({
					templateUrl: 'app/src/sites/view/uploadDocuments.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
					scope: $scope,        // use parent scope in template
					preserveScope: true,  // do not forget this if use parent scope
					clickOutsideToClose: true
				});
			};

			vm.deleteFile = function (nodeRef) {
				siteService.deleteFile(nodeRef);

				vm.reload();
			}

			vm.deleteFoldereDialog = function (event, nodeRef) {
			   var confirm = $mdDialog.confirm()
			         .title('Would you like to delete this folder?')
			         .textContent('This will delete this folder with all its contents.')
			         .ariaLabel('Sluk mappe')
			         .targetEvent(event)
			         .ok('Yes')
			         .cancel('Nej, tak');

			   $mdDialog.show(confirm).then(function() {
			     vm.deleteFolder(nodeRef);
			   });
			};

			vm.deleteFolder = function (nodeRef) {
				siteService.deleteFolder(nodeRef);

				vm.reload();
			}


			vm.loadContents = function() {
				cmisService.getFolderNodes($stateParams.projekt + $stateParams.path).then(function (val) {
					var result = [];
					for (var x in val.data.objects) {
						result.push({
							name: val.data.objects[x].object.succinctProperties["cmis:name"],
							contentType: val.data.objects[x].object.succinctProperties["cmis:objectTypeId"],
							nodeRef: val.data.objects[x].object.succinctProperties["alfcmis:nodeRef"]
						});
					}
					$scope.contents = result;
				});
				vm.upDateBreadCrumb();
			}
			vm.loadContents();

			vm.loadMembers = function () {
				siteService.getSiteMembers(vm.project).then(function (val) {
					$scope.members = val;
				});
			}
			vm.loadMembers();


			vm.newMember = function (event) {
				$mdDialog.show({
					templateUrl: 'app/src/sites/view/newMember.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
					scope: $scope,        // use parent scope in template
					preserveScope: true,  // do not forget this if use parent scope
					clickOutsideToClose: true
				});
			};


			vm.upload = function (files) {
				var cmisQuery = $stateParams.projekt + $stateParams.path;
				cmisService.getNode(cmisQuery).then(function (val) {

					var currentFolderNodeRef = val.data.properties["alfcmis:nodeRef"].value;

					for (var i = 0; i < files.length; i++) {
						siteService.uploadFiles(files[i], currentFolderNodeRef).then(function(response){
							vm.loadContents();
							} );
					}
					$mdDialog.cancel();

				});
			};

			vm.getSiteRoles = function(name) {
				siteService.getSiteRoles(name).then(function(val){
					vm.roles = val;
				});
			};

			vm.updateRoleOnSiteMember = function(siteName, userName, role) {
				siteService.updateRoleOnSiteMember(siteName, userName, role).then(function(val){
					// do stuff
				});
			};

			vm.addMemberToSite = function(siteName, userName, role) {
				siteService.addMemberToSite(siteName, userName, role).then(function(val){
					vm.loadMembers();
				});
				$mdDialog.hide();
			};

			vm.removeMemberFromSite = function(siteName, userName) {
				siteService.removeMemberFromSite(siteName, userName).then(function(val){
					// do stuff
				});
			};

			vm.getAllUsers = function(filter) {
				return siteService.getAllUsers(filter)
			};

		}; // SiteCtrl close
