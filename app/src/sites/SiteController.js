'use strict';

    angular
        .module('openDeskApp.sites')
        .controller('SiteController', SiteController);
        
        function SiteController($scope, $mdDialog, $window, siteService, cmisService, $stateParams, $location, documentPreviewService, alfrescoDownloadService, documentService, notificationsService, authService) {

			var vm = this;
			$scope.contents = [];
			$scope.members = [];
			$scope.roles = [];
			$scope.roles = [];

			vm.project = $stateParams.projekt;





			// Compile paths for breadcrumb directive
			vm.paths = [
				{
					title: 'Projekter',
					link: '#/projekter'
				},
				{
					title: vm.project,
					link: '#/projekter/' + vm.project
				}
			];
			var pathArr = $stateParams.path.split('/');
			for (var a in pathArr) {
				if (pathArr[a] !== '') {
					vm.paths.push({
						title: pathArr[a],
						link: '#/projekter/' + vm.project + '/' + pathArr[a]
					});
				};
			};

			// // testing of the move/copy
			  var nodeRef = "workspace://SpacesStore/d4a3e854-7cfd-483c-a117-b4fc0ce102e9";
			// //var nodeRef2 = "workspace://SpacesStore/8bf7cd04-dfd7-4342-8864-91bdce706504";
			//


			// siteService.moveNodeRefs([nodeRef], "workspace://SpacesStore/7cb5adc4-f18c-42d0-8225-6a00d6c31e68", "workspace://SpacesStore/d41769e3-704c-4dfd-825b-7b7dbf847bef")

			
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

			vm.loadSiteData = function () {
				var r = siteService.loadSiteData(vm.project);

				r.then(function(result) {
					vm.project_title = result;
				});

			}
			vm.loadSiteData();

			vm.loadContents = function() {

				var currentFolderNodeRef_cmisQuery = $stateParams.projekt + "/documentLibrary/" + $stateParams.path;

				cmisService.getNode(currentFolderNodeRef_cmisQuery).then(function (val) {
					var currentFolderNodeRef = val.data.properties["alfcmis:nodeRef"].value;

					console.log(currentFolderNodeRef);

					cmisService.getFolderNodes($stateParams.projekt + "/documentLibrary/" + $stateParams.path).then(function (val) {
						var result = [];
						for (var x in val.data.objects) {

							var ref = val.data.objects[x].object.succinctProperties["alfcmis:nodeRef"];

							documentService.getPath(ref.split("/")[3]).then(function(val) {});

							var shortRef = ref.split("/")[3];

							result.push({
								name: val.data.objects[x].object.succinctProperties["cmis:name"],
								contentType: val.data.objects[x].object.succinctProperties["cmis:objectTypeId"],
								nodeRef: val.data.objects[x].object.succinctProperties["alfcmis:nodeRef"],
								parentNodeRef: currentFolderNodeRef,
								shortRef: shortRef
							});
						}
						$scope.contents = result;
					});
				});
			}


			vm.loadContents();

			vm.createFolder = function (folderName) {
				var currentFolderNodeRef;
				var cmisQuery = $stateParams.projekt + "/documentLibrary/" + $stateParams.path;

				cmisService.getNode(cmisQuery).then(function (val) {
					currentFolderNodeRef = val.data.properties["alfcmis:nodeRef"].value;

					var props = {
						prop_cm_name: folderName,
						prop_cm_title: folderName,
						alf_destination: currentFolderNodeRef
					};

					siteService.createFolder("cm:folder", props);

					vm.loadContents();
				});
				
				$mdDialog.hide();
			}
			
			vm.newFolderDialog = function (event) {
				$mdDialog.show({
					templateUrl: 'app/src/sites/view/newFolder.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
					scope: $scope,
        	preserveScope: true,
					clickOutsideToClose: true
				});
			};

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

			vm.reviewDocumentsDialog = function (event, nodeRef) {

				$scope.nodeRef = nodeRef;

				$mdDialog.show({
					templateUrl: 'app/src/sites/view/reviewDocument.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
					scope: $scope,        // use parent scope in template
					preserveScope: true,  // do not forget this if use parent scope
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

			vm.reviewDocument = function (document, reviewer, comment) {


			}

			vm.deleteFile = function (nodeRef) {
				siteService.deleteFile(nodeRef).then(function (val) {
					vm.loadContents();
				});
				
				$mdDialog.hide();
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
				siteService.deleteFolder(nodeRef).then(function (val) {
					vm.loadContents();
				});
				
				$mdDialog.hide();
			}

			vm.createReviewNotification = function (documentNodeRef, receiver, subject, comment) {

				var s = documentNodeRef.split("/");
				var ref = (s[3])

				notificationsService.addWFNotice(authService.getUserInfo().user.userName, receiver, subject, comment, ref).then (function (val) {
					console.log(val);
				});
			}


			

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

				var cmisQuery = $stateParams.projekt  + "/documentLibrary/" + $stateParams.path;
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
					vm.loadMembers();
				});
				$mdDialog.hide();
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
			         .cancel('Nej, tak');

			   $mdDialog.show(confirm).then(function() {
			     vm.removeMemberFromSite(siteName, userName);
			   });
			};

			vm.removeMemberFromSite = function(siteName, userName) {
				siteService.removeMemberFromSite(siteName, userName).then(function(val){
					vm.loadMembers();
				});
				
				$mdDialog.hide();
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

			vm.copyNodeRefs = function copyNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef) {
				siteService.copyNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef)
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
			
	    	});
				
				
			}
			
			vm.renameDocument = function renameDocument(docNodeRef, newName) {
				var props = {
					prop_cm_name: newName
				};
				
				siteService.updateNode(docNodeRef, props).then(function(val){
					vm.loadContents();
				});
				
				$mdDialog.hide();
			}



			// vm.test = function test() {
			// 	var nodeRef = "workspace://SpacesStore/8c23bfdb-e1bb-4f17-9682-144404bca3e3";
			// 	var newName = "gufsssssfy.jpg"
			//
			// 	vm.renameDocument(nodeRef, newName);
			// }



		}; // SiteCtrl close



//TODO: refactor all the methods that dont belong here to a relevant server- and pass on the call to them in the controller