'use strict';

    angular
        .module('openDeskApp.sites')
        .controller('SiteController', SiteController);
        
        function SiteController($scope, $mdDialog, $window, siteService, cmisService, $stateParams, $location, documentPreviewService, alfrescoDownloadService) {

			var vm = this;
			$scope.contents = [];
			$scope.members = [];
			$scope.roles = [];

			vm.project = $stateParams.projekt;
			vm.path = $stateParams.path;
			vm.breadCrumb = [{slug: vm.project, link: '/'}];

			//// testing of the move/copy
			//var nodeRef = "workspace://SpacesStore/c0951576-6104-4aaf-8c85-49dfa8b758db";
			////var nodeRef2 = "workspace://SpacesStore/8bf7cd04-dfd7-4342-8864-91bdce706504";
            //
			//vm.source = [nodeRef];
			//vm.dest = "workspace://SpacesStore/53e662db-74f3-49ee-a15e-eb0c58c6b3b0"; // folder: 1
			//vm.parentId = "workspace://SpacesStore/de35297e-9317-42f0-9ce9-89c58976df7a";
			
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
			
			var originatorEv;
			vm.openMenu = function($mdOpenMenu, event) {
			  originatorEv = event;
			  $mdOpenMenu(event);
			};
			

			// vm.deleteSite = function (project) {
			// 	//  var confirm = $mdDialog.confirm()
			// 	// 	.clickOutsideToClose(true)
			// 	// 	.title('Vil du slette dette projekt?')
			// 	// 	.textContent('Projektet og alle dets filer vil blive fjernet')
			// 	// 	.ok('Slet')
			// 	// 	.cancel('Annullér');
			// 	// $mdDialog.show(confirm).then(function() {
			// 	// 	siteService.deleteSite(project);
			// 	// 	$window.location.reload();
			// 	// 	$window.location.href = '#/projekter';
			// 	// });
			// }

			// vm.renameSiteDialog = function (event) {
// 				$mdDialog.show({
// 					templateUrl: 'app/src/sites/view/renameSite.tmpl.html',
// 					parent: angular.element(document.body),
// 					targetEvent: event,
// 					scope: $scope,        // use parent scope in template
// 					preserveScope: true,  // do not forget this if use parent scope
// 					clickOutsideToClose: true
// 				});
// 			};
//
// 			vm.updateSiteName = function (newName) {
// 				var r = siteService.updateSiteName(vm.project, newName);
//
// 				r.then(function(result){
// 					vm.project_title=result.title;
// 						console.log(result);
// 					$mdDialog.hide();
//
// 					});
// 			}

			vm.loadSiteData = function () {
				var r = siteService.loadSiteData(vm.project);

				r.then(function(result) {
					vm.project_title = result;
				});


			}
			vm.loadSiteData();


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


			vm.deleteFileDialog = function (event, nodeRef) {
  			var confirm = $mdDialog.confirm()
  			      .title('Would you like to delete this file?')
  			      .textContent('Something happens in danish.')
  			      .ariaLabel('Sluk dokument')
  			      .targetEvent(event)
  			      .ok('Yes')
  			      .cancel('Nej, tak');
  			
  			$mdDialog.show(confirm).then(function() {
  			  vm.deleteFile(nodeRef);
					
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
				siteService.deleteFile(nodeRef).then(function(val){
					vm.loadContents();
				});
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

			vm.loadSiteRoles = function() {
				   siteService.getSiteRoles(vm.project).then(function(response){
					   $scope.roles = response.siteRoles;
				});
			};
			vm.loadSiteRoles();

			vm.currentDialogUser = '';

			vm.updateMemberRoleDialog = function(event, user) {
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

			vm.deleteMemberDialog = function (siteName, userName) {
				var confirm = $mdDialog.confirm()
					.title('Would you like to delete this member?')
					.textContent('Something på dansk.')
					.ariaLabel('Sluk medlem')
					.targetEvent(event)
					.ok('Yes')
					.cancel('Nej, tak')

				$mdDialog.show(confirm).then(function() {
					vm.removeMemberFromSite(siteName, userName);
				});
			};

			vm.removeMemberFromSite = function(siteName, userName) {
				siteService.removeMemberFromSite(siteName, userName).then(function(val){
					vm.loadMembers();
				});
			};

			vm.getAllUsers = function(filter) {
				return siteService.getAllUsers(filter)
			};

			vm.previewDocument = function previewDocument(nodeRef){
				documentPreviewService.previewDocument(nodeRef);
			}

			vm.downloadDocument = function downloadDocument(nodeRef, name){
				alfrescoDownloadService.downloadFile(nodeRef, name);
			}

			vm.moveNodeRefs = function moveNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef) {
				siteService.moveNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef)
			}

			vm.copyNodeRefs = function moveNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef) {
				siteService.moveNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef)
			}

			
			vm.renameDocumentDialog = function(event, docNodeRef) {
				var confirm = $mdDialog.prompt()
	      	.title('What would you like name this?')
	      	.placeholder('Name')
	      	.ariaLabel('Name')
	      	.targetEvent(event)
	      	.ok('Rename')
	      	.cancel('Annullér');
	    	$mdDialog.show(confirm).then(function(result) {
					var newName = result;					
					vm.renameDocument(docNodeRef, newName);
					vm.reload();
	    	});
			}
			
			vm.renameDocument = function renameDocument(docNodeRef, newName) {

				var props = {
					prop_cm_name: newName
				};

				siteService.updateNode(docNodeRef, props);
			}

			// vm.test = function test() {
			// 	var nodeRef = "workspace://SpacesStore/8c23bfdb-e1bb-4f17-9682-144404bca3e3";
			// 	var newName = "gufsssssfy.jpg"
			//
			// 	vm.renameDocument(nodeRef, newName);
			// }



		}; // SiteCtrl close

