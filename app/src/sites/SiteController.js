'use strict';

angular
    .module('openDeskApp.sites')
    .controller('SiteController', SiteController);

    function SiteController($q, $scope, $timeout, $mdDialog, $window, $location, siteService, cmisService, $stateParams, documentPreviewService,
                            alfrescoDownloadService, documentService, notificationsService, authService, $rootScope,
                            searchService, $state, userService, groupService, preferenceService) {

                            
        $scope.role_mapping = {};
        $scope.role_mapping["SiteManager"] = "Projektleder";
        $scope.role_mapping["SiteContributor"] = "Kan skrive";
        $scope.role_mapping["SiteConsumer"] = "Kan læse";

        $scope.role_translation = {};
        $scope.role_translation["1"] = "Projektleder";
        $scope.role_translation["2"] = "Kan skrive";
        $scope.role_translation["3"] = "Kan læse";

        $scope.role_mapping_reverse = {};
        $scope.role_mapping_reverse["1"] = "SiteManager";
        $scope.role_mapping_reverse["2"] = "SiteContributor";
        $scope.role_mapping_reverse["3"] = "SiteConsumer";
        
        $scope.contents = [];
        $scope.history = [];
        $scope.members = [];
        $scope.allMembers = [];
        $scope.roles = [];
        $scope.roles_translated = [];
        
        var originatorEv;
        var vm = this;

        vm.allMembers = [];
        vm.project = {};
        vm.path = $stateParams.path;
        vm.userRole = 'SiteConsumer';
        
        vm.currentUser = authService.getUserInfo().user;
		vm.uploadedToSbsys = false;
		vm.showProgress = false;
        
        vm.editSiteDialog = editSiteDialog;
        vm.goToLOEditPage = goToLOEditPage;
        vm.updateSiteName = updateSiteName;
        
        
        function loadSiteData() {
            siteService.loadSiteData($stateParams.projekt).then(
                function (result) {
                    
                    vm.project = result;
                    console.log('Project information');
                    console.log(vm.project);
                    
                    getSitesPerUser();
                    getSiteUserRole();
                    loadMembers();
                    loadSiteRoles();
                    
                    // Compile paths for breadcrumb directive
                    vm.paths = buildBreadCrumbPath(vm.project.title);
                    
                    vm.currentFolderNodeRef_cmisQuery = vm.project.shortName + "/documentLibrary/" + vm.path;
    
                    cmisService.getNode(vm.currentFolderNodeRef_cmisQuery).then(function (val) {
                        vm.currentFolderNodeRef = val.data.properties["alfcmis:nodeRef"].value;
                        vm.currentFolderUUID = vm.currentFolderNodeRef.split("/")[3];
                        // The loading function for contents depend on the currentFolder variables having been read beforehand
                        vm.loadContents();
                    });
                    
                }
            );
        }
        loadSiteData();

    
        //siteService.getAllUsers("a");
        //siteService.addUser(vm.project, "abeecher", "PD_MONITORS");
		//siteService.addMemberToSite("nytnyt","abeecher","SiteManager");
        
        function getSitesPerUser() {
            return siteService.getSitesPerUser().then(function(response) {
                    vm.sitesPerUser = response;
                    return response;
                }
            );
        }
        
        
        function getSiteUserRole() {
            siteService.getSiteUserRole(vm.project.shortName, vm.currentUser.userName).then(
                function (response) {
                    vm.userRole = response;
                },
                function (err) {
                    console.log('Error getting site user role');
                    console.log(err);
                }
            );
        }
        
        
        function translation_to_value(translation) {
            for (var x in $scope.role_translation) {
                var v = $scope.role_translation[x];
                if (v === translation) {
                    return x;
                }
            }
        }

			
        function buildBreadCrumbPath(project_title) {
            var paths = [
                {
                    title: 'Projekter',
                    link: '#!/projekter'
                },
                {
                    title: project_title,
                    link: '#!/projekter/' + vm.project.shortName
                }
            ];
            var pathArr = $stateParams.path.split('/');
            var pathLink = '/';
            for (var a in pathArr) {
                if (pathArr[a] !== '') {
                    paths.push({
                        title: pathArr[a],
                        link: '#!/projekter/' + vm.project.shortName + pathLink + pathArr[a]
                    });
                    pathLink = pathLink + pathArr[a] + '/';
                }
            }
            return paths;
        }
    
    
        vm.cancel = function () {
            $mdDialog.cancel();
        };
    
    
        vm.reload = function () {
            $window.location.reload();
        };
    
        
        vm.openMenu = function ($mdOpenMenu, event) {
            originatorEv = event;
            $mdOpenMenu(event);
        };
    
    
        vm.loadContents = function () {
            siteService.getContents(vm.currentFolderUUID).then(function (response) {
                $scope.contents = response;
            });
    
        };
    
    
        vm.loadHistory = function (doc) {
            $scope.history = [];
            documentService.getHistory(doc).then(function (val) {
                $scope.history = val;
            });
        };
    
    
        vm.createFolder = function (folderName) {
            var props = {
                prop_cm_name: folderName,
                prop_cm_title: folderName,
                alf_destination: vm.currentFolderNodeRef
            };
            siteService.createFolder("cm:folder", props).then(function (response) {
                vm.loadContents();
            });
            $mdDialog.hide();
        };
    
    
        vm.createLink = function (project) {
            siteService.createLink(vm.project.shortName, project.shortName).then(function () {
                vm.loadContents();
                $mdDialog.hide();
            });
        };
    
    
        vm.deleteLink = function (source, destination) {
    
            siteService.deleteLink(source, destination).then(function () {
                vm.loadContents();
                $mdDialog.hide();
            });
        };
		
        
		vm.loadFromSbsys = function() {
			
			siteService.loadFromSbsys().then(function() {
				vm.loadContents();
				$mdDialog.hide();
			});
		};
		
        
		vm.uploadSbsys = function (){
			vm.showProgress = true;
			$timeout(setSbsysShowAttr, 2500);
		};
		
        
		function setSbsysShowAttr() {
			vm.showProgress = false;
			vm.uploadedToSbsys = true;
		}
	
		
		 vm.cancelSbsysDialog = function () {
			vm.showProgress = false;
			vm.uploadedToSbsys = false;
            $mdDialog.cancel();
        };
    
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
               
        vm.newLinkDialog = function (event) {
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/newLink.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true
            });
        };
		
		vm.uploadSbsysDialog = function (event) {
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/uploadSbsys.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true
            });
        };
		
		vm.loadSbsysDialog = function (event) {
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/loadSbsys.tmpl.html',
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
    
    
        vm.uploadNewVersionDialog = function (event) {
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/uploadNewVersion.tmpl.html',
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
                .title('Slette denne fil?')
                .textContent('')
                .ariaLabel('Slet dokument')
                .targetEvent(event)
                .ok('Slet')
                .cancel('Nej, tak');
    
            $mdDialog.show(confirm).then(function () {
                vm.deleteFile(nodeRef);
            });
        };
    
        vm.reviewDocument = function (document, reviewer, comment) {
    
        };
    
        vm.deleteFile = function (nodeRef) {
            siteService.deleteFile(nodeRef).then(function (val) {
                vm.loadContents();
            });
    
            $mdDialog.hide();
        };
    
    
        vm.deleteFoldereDialog = function (event, nodeRef) {
            var confirm = $mdDialog.confirm()
                .title('Slette denne mappe?')
                .textContent('Dette vil slette mappen med alt dens indhold')
                .ariaLabel('Slet mappe')
                .targetEvent(event)
                .ok('Slet')
                .cancel('Nej, tak');
    
            $mdDialog.show(confirm).then(function () {
                vm.deleteFolder(nodeRef);
            });
        };
    
    
        vm.deleteFolder = function (nodeRef) {
            siteService.deleteFolder(nodeRef).then(function (val) {
                vm.loadContents();
            });
    
            $mdDialog.hide();
        };
    
    
        function createNotification(userName, subject, message, link) {
            notificationsService.addNotice(userName, subject, message, link).then(function (val) {
                $mdDialog.hide();
            });
        }
    
    
        function createSiteNotification(userName, site) {
                var subject = "Du er blevet tilføjet til " + vm.project.title;
                var message = "Du er blevet tilføjet til projektet " + vm.project.title + ".";
                var link = "/#!/projekter/" + site + "?type=Project";
                createNotification(userName, subject, message, link);
        }
    
    
        function createDocumentNotification(projekt, ref, fileName) {
            var creatorFirstName = vm.currentUser.firstName;
            var creatorLastName = vm.currentUser.lastName;
            var creatorFullName = creatorFirstName + " " + creatorLastName;
            var subject = "Ny fil i " + projekt;
            var message = "En ny fil \"" + fileName + "\" er blevet uploadet af " + creatorFullName;
            var link = "/#!/dokument/" + ref;

            // Creating an empty initial promise that always resolves itself.
            var promise = $q.all([]);

            // Iterating list of items.
            angular.forEach($scope.allMembers, function (userName) {
                if (userName != vm.currentUser.userName) {
                    var preferenceFilter = "dk.magenta.sites.receiveNotifications";

                    promise = preferenceService.getPreferences(userName, preferenceFilter).then(function (data) {
                        var receiveNotifications = "true";
                        if (data[preferenceFilter] != null) {
                            receiveNotifications = data[preferenceFilter];
                        }
                        if (receiveNotifications != null && receiveNotifications == "true") {
                            console.log("Sending notification to : " + userName);
                            createNotification(userName, subject, message, link);
                        }
                    });
                }
            });
        }
    

        vm.createReviewNotification = function (documentNodeRef, userName, subject, message) {
            var creator = vm.currentUser.userName;
            var s = documentNodeRef.split("/");
            var ref = (s[3]);
            var link = "/#!/dokument/" + ref + "?dtype=wf" + "&from=" + creator;
            createNotification(userName, subject, message, link);
        };
    
    
        function loadMembers() {
            siteService.getSiteMembers(vm.project.shortName).then(function (val) {
                $scope.members = val;
                //console.log("$scope.members: " + $scope.members);
            });
            siteService.getAllMembers(vm.project.shortName, vm.project.type).then(function (val) {
                $scope.allMembers = val;
            });
        }
    
    
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
    
            for (var i = 0; i < files.length; i++) {
                siteService.uploadFiles(files[i], vm.currentFolderNodeRef).then(function (response) {
                    vm.loadContents();
                    var ref = response.data.nodeRef.split("/")[3];
                    createDocumentNotification(vm.project.title, ref, response.data.fileName);
                });
            }
            $mdDialog.cancel();
        };
    
    
        function loadSiteRoles() {
            if (vm.project.type !== 'PD-Project') {
                siteService.getSiteRoles(vm.project.shortName).then(function (response) {
                    $scope.roles_translated = [];
                    for (var x in response.siteRoles) {
                        if ($scope.role_mapping[response.siteRoles[x]] !== undefined) {
                            $scope.roles_translated.push($scope.role_mapping[response.siteRoles[x]]);
                        }
                    }
                    //$scope.roles = response.siteRoles;
                });
            } else {
                $scope.roles_translated = [];
                $scope.roles_translated.push("Kan læse");
                $scope.roles_translated.push("Kan skrive");
            }
        }
    
    
        vm.currentDialogUser = '';
    
    
        vm.updateMemberRoleDialog = function (event, currentUser, currentRole) {
            vm.currentDialogUser = currentUser;
            vm.currentDialogRole = currentRole;
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/updateRole.tmpl.html',
                parent: angular.element(document.body),
                scope: $scope,
                preserveScope: true,
                targetEvent: event,
                clickOutsideToClose: true
            });
        };
    
    
        vm.updateRoleOnSiteMember = function (siteName, user, role) {
            // getTheValue
            var role_int_value = translation_to_value(role);
            var role_alfresco_value = $scope.role_mapping_reverse[role_int_value];
    
            siteService.updateRoleOnSiteMember(siteName, user.userName, role_alfresco_value).then(function (val) {
                loadMembers();
            });
            $mdDialog.hide();
        };
        
    
        vm.addMemberToSite = function (siteName, userName, role) {
    
            // getTheValue
            var role_int_value = translation_to_value(role);
            var role_alfresco_value = $scope.role_mapping_reverse[role_int_value];
    
    
            siteService.addMemberToSite(siteName, userName, role_alfresco_value).then(function (val) {
                createSiteNotification(userName, siteName);
                loadMembers();
            });
            $mdDialog.hide();
        };
    
    
        vm.deleteMemberDialog = function (ev, siteName, userName) {
            var confirm = $mdDialog.confirm()
                .title('Slette dette medlem?')
                .textContent('')
                .ariaLabel('Slet medlem')
                .targetEvent(ev)
                .ok('Slet')
                .cancel('Nej, tak');
    
            $mdDialog.show(confirm).then(
                function() {
                    vm.removeMemberFromSite(siteName, userName);
                },
                function() {
                    console.log('cancelled delete');
                }
            );
        };
    
    
        vm.removeMemberFromSite = function (siteName, userName) {
            siteService.removeMemberFromSite(siteName, userName).then(function (val) {
                loadMembers();
            });
    
            $mdDialog.hide();
        };
    
    
        vm.getAllUsers = function (filter) {
            return siteService.getAllUsers(filter);
        };
    
    
        vm.previewDocument = function previewDocument(nodeRef) {
            documentPreviewService.previewDocument(nodeRef);
        };
    
    
        vm.downloadDocument = function downloadDocument(nodeRef, name) {
            alfrescoDownloadService.downloadFile(nodeRef, name);
        };
    
    
        vm.moveFileDialog = function moveFileDialog(event, nodeRef, parentNodeRef) {
            vm.source = [];
            vm.source.push(nodeRef);
            vm.parentId = parentNodeRef;
    
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/moveNodeRefs.tmpl.html',
                parent: angular.element(document.body),
                scope: $scope,
                preserveScope: true,
                targetEvent: event,
                clickOutsideToClose: true
            }).then(function () {
                console.log('Dispatching move action');
            }, function () {
                console.log('You cancelled a move action');
            });
        };
    
    
        vm.copyFileDialog = function copyFileDialog(event, nodeRef, parentNodeRef) {
            vm.source = [];
            vm.source.push(nodeRef);
            vm.parentId = parentNodeRef;
    
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/copyNodeRefs.tmpl.html',
                parent: angular.element(document.body),
                scope: $scope,
                preserveScope: true,
                targetEvent: event,
                clickOutsideToClose: true
            }).then(function () {
                console.log('Dispatching copy action');
            }, function () {
                console.log('You cancelled a copy action');
            });
        };
    
    
        vm.moveNodeRefs = function moveNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef) {
            siteService.moveNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef).then(function (response) {
                $mdDialog.hide();
    
                if (response.data.results[0].fileExist) {
    
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .clickOutsideToClose(true)
                            .title('Der er allerede en fil med samme navn i mappen du valgte.')
                            .ariaLabel('Eksisterer allerede')
                            .ok('Ok')
                    );
                } else {
                    vm.loadContents();
                }
                return response;
            });
        };
    
    
        vm.copyNodeRefs = function copyNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef) {
            siteService.copyNodeRefs(sourceNodeRefs, destNodeRef, parentNodeRef).then(function (response) {
                $mdDialog.hide();
    
                if (response.data.results[0].fileExist) {
    
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .clickOutsideToClose(true)
                            .title('Der er allerede en fil med samme navn i mappen du valgte.')
                            .ariaLabel('Eksisterer allerede')
                            .ok('Ok')
                    );
                } else {
                    vm.loadContents();
                }
                return response;
            });
        };
    
    
        vm.renameDocumentDialog = function (event, docNodeRef) {
            var confirm = $mdDialog.prompt()
                .title('Hvordan vil du navngive dette?')
                .placeholder('Navn')
                .ariaLabel('Navn')
                .targetEvent(event)
                .ok('Omdøb')
                .cancel('Annullér');
            $mdDialog.show(confirm).then(function (result) {
                var newName = result;
                vm.renameDocument(docNodeRef, newName);
            });
        };
    
    
        vm.renameDocument = function renameDocument(docNodeRef, newName) {
            var props = {
                prop_cm_name: newName
            };
    
            siteService.updateNode(docNodeRef, props).then(function (val) {
                vm.loadContents();
            });
    
            $mdDialog.hide();
        };
    
    
        vm.getSearchresults = function getSearchReslts(term) {
            return searchService.getSearchResults(term).then(function (val) {
    
                if (val !== undefined) {
    
                    $rootScope.searchResults = [];
                    $rootScope.searchResults = val.data.items;
    
                    window.location.href = "#!/search";
    
                } else {
                    return [];
                }
            });
        };
    
    
        vm.getAutoSuggestions = function getAutoSuggestions(term) {
            return searchService.getSearchSuggestions(term).then(function (val) {
    
                if (val !== undefined) {
                    return val;
                }
                else {
                    return [];
                }
            });
        };
    
    
        vm.gotoPath = function (nodeRef) {
    
            var ref = nodeRef;
    
            documentService.getPath(ref.split("/")[3]).then(function (val) {
    
                $scope.selectedDocumentPath = val.container;
                // var project = val.site;
                // var container = val.container;
                // var path = val.path;
    
                var path = ref.replace("workspace://SpacesStore/", "");
                $window.location.href = "/#!/dokument/" + path;
    
            });
        };
    
    
        //Goes to the libreOffice online edit page
        function goToLOEditPage(nodeRef) {
            console.log('Transitioning to the LOOL page with nodeRef: ' + nodeRef);
            $state.go('lool', {'nodeRef': nodeRef});
        };

        
        function editSiteDialog() {
            $mdDialog.show({
                templateUrl: 'app/src/sites/view/renameSite.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                scope: $scope,        // use parent scope in template
                preserveScope: true,  // do not forget this if use parent scope
                clickOutsideToClose: true
            });
        }
        
        
        function updateSiteName() {
            siteService.updateSiteName(vm.project.shortName, vm.project.title, vm.project.description).then(
                function(result){
                    vm.project.title = result.title;
                    vm.project.description = result.description;
                    $mdDialog.hide();
                }
            );
        }
        

    }
            

//TODO: refactor all the methods that dont belong here to a relevant server- and pass on the call to them in the controller
