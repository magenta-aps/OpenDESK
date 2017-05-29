'use strict';

angular
    .module('openDeskApp.sites')
    .controller('SiteController', SiteController);

function SiteController($q, $scope, $timeout, $mdDialog, $window, $location, siteService, cmisService, $stateParams, documentPreviewService,
    alfrescoDownloadService, documentService, notificationsService, authService, $rootScope, $translate,
    searchService, $state, userService, groupService, preferenceService, sessionService, filterService, fileUtilsService) {


    $scope.role_mapping = {};
    $scope.role_mapping["SiteManager"] = "Projektleder";
    $scope.role_mapping["SiteCollaborator"] = "Kan skrive";
    $scope.role_mapping["SiteConsumer"] = "Kan læse";

    $scope.role_mapping_id = {};
    $scope.role_mapping_id["SiteManager"] = 1;
    $scope.role_mapping_id["SiteCollaborator"] = 2;
    $scope.role_mapping_id["SiteConsumer"] = 3;

    $scope.role_translation = {};
    $scope.role_translation["1"] = "Projektleder";
    $scope.role_translation["2"] = "Kan skrive";
    $scope.role_translation["3"] = "Kan læse";

    $scope.role_mapping_reverse = {};
    $scope.role_mapping_reverse["1"] = "SiteManager";
    $scope.role_mapping_reverse["2"] = "SiteCollaborator";
    $scope.role_mapping_reverse["3"] = "SiteConsumer";

    $scope.contents = [];
    //$scope.object = [];
    $scope.history = [];
    $scope.members = [];
    $scope.allMembers = [];
    $scope.roles = [];
    $scope.roles_translated = [];

    var originatorEv;
    var vm = this;

    vm.allMembers = [];
    vm.project = {};
    vm.userManagedProjects = [];
    vm.path = $stateParams.path == undefined ? '' : $stateParams.path;
    vm.userRole = 'Consumer';
    vm.editRole = 'Collaborator';
    vm.managerRole = 'Manager';
    vm.outsiderRole = 'Outsider';
    vm.ownerRole = "Owner";
    vm.canEdit = false;
    vm.isManager = false;
    vm.isMember = false;
    vm.isAdmin = sessionService.isAdmin();
    vm.newTemplateName = '';
    vm.newFileName = '';

    vm.sendToEsdh = false;

    vm.strings = {};
    vm.strings.templateProject = "Template-Project";
    vm.strings.project = "Project";

    vm.currentUser = authService.getUserInfo().user;
    vm.uploadedToSbsys = false;
    vm.showProgress = false;
    vm.hasDescription = false;

    vm.editSiteDialog = editSiteDialog;
    vm.goToLOEditPage = goToLOEditPage;
    vm.updateSiteName = updateSiteName;
    vm.createDocumentFromTemplate = createDocumentFromTemplate;
    vm.deleteFile = deleteFile;

    vm.documentTab = '/dokumenter';

    $scope.searchProjects = searchProjects;

    siteService.getTemplateDocuments().then(function (response) {
        $scope.templateDocuments = response;

        if($scope.templateDocuments != undefined)
            vm.addThumbnailUrl($scope.templateDocuments);
    })

    $scope.selectedTab = $state.current.data.selectedTab;
  
    function loadSiteData() {
        console.log('load site data');
        siteService.loadSiteData($stateParams.projekt).then(
            function (result) {

                vm.project = result;
                vm.hasDescription = vm.project.description.trim() === "" ? false : true;

                vm.project.visibility = vm.project.visibility == 'PUBLIC' ? false : true;

                siteService.setType(vm.project.type);

                getUserManagedProjects();
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

    function getUserManagedProjects() {
        return siteService.getSitesPerUser().then(function (response) {
            for (var i in response) {
                if (response[i].shortName !== vm.project.shortName && response[i].current_user_role == vm.managerRole)
                    vm.userManagedProjects.push(response[i]);
            }
            return vm.userManagedProjects;
        });
    }

    function searchProjects(query) {
        return filterService.search(vm.userManagedProjects, {
            title: query
        });
    }

    function getSiteUserRole() {
        if (vm.isAdmin) {
            vm.isManager = true;
            vm.isMember = true;
            vm.canEdit = true;
            vm.userRole = vm.managerRole;
        } else {
            siteService.getCurrentUserSiteRole(vm.project.shortName).then(
                function (response) {
                    vm.userRole = response;
                    vm.isManager = vm.userRole == vm.managerRole;
                    switch (vm.userRole) {
                        case vm.editRole:
                        case vm.ownerRole:
                        case vm.managerRole:
                            vm.canEdit = true;
                            break;
                        default:
                            vm.canEdit = false;
                            break;
                    }
                    vm.isMember = vm.userRole != vm.outsiderRole;
                },
                function (err) {
                    console.log('Error getting site user role');
                    console.log(err);
                }
            );
        }
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
        var title, link;
        if (vm.project.type == vm.strings.templateProject) {
            title = $translate.instant('SYSTEM_SETTINGS.SYSTEM_SETTINGS');
            link = '#!/indstillinger/systemopsætning/skabeloner';
        } else {
            title = $translate.instant('PROJECT.PROJECTS');
            link = '#!/projekter';
        }
        var paths = [{
                title: title,
                link: link
            },
            {
                title: project_title,
                link: '#!/projekter/' + vm.project.shortName + vm.documentTab
            }
        ];
        if ($stateParams.path != undefined) {
            var pathArr = $stateParams.path.split('/');
            var pathLink = '/';
            for (var a in pathArr) {
                if (pathArr[a] !== '') {
                    paths.push({
                        title: pathArr[a],
                        link: '#!/projekter/' + vm.project.shortName + vm.documentTab + pathLink + pathArr[a]
                    });
                    pathLink = pathLink + pathArr[a] + '/';
                }
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

    vm.openMemberInfo = function (member, event) {
        var username;
        if(member.userName != undefined)
            username = member.userName;
        else if(member.authority.userName != undefined)
            username = member.authority.userName;

        userService.getPerson(username).then(function (data) {
            member = data;
            userService.getAvatar(username).then(function (data) {
                $mdDialog.show({
                    controller: ['$scope', 'member', function ($scope, member) {
                        $scope.member = member;
                        $scope.avatar = data;
                    }],
                    templateUrl: 'app/src/sites/view/infoMember.tmpl.html',
                    locals: {
                        member: member
                    },
                    parent: angular.element(document.body),
                    targetEvent: event,
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true
                });
            });
        });
    }

    vm.roleComparator = function (user) {
        return $scope.role_mapping_id[user.role];
    }

    vm.fileComparator = function (files) {
        switch (files.contentType) {
            case 'cmis:document':
                return 1;

            case 'cmis:folder':
                return 2;

            case 'cmis:link':
                return 3;
        }
    }

    vm.loadContents = function () {
        siteService.getContents(vm.currentFolderUUID).then(function (response) {
            $scope.contents = response;
            //$scope.object.contents = response;
            vm.addThumbnailUrl($scope.contents);
            console.log('load contents');
        });

    };

    vm.addThumbnailUrl = function (files) {
        files.forEach(function (item) {
            item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimeType, 24);
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
            $mdDialog.hide();
        });
    };


    vm.createLink = function (project) {
        siteService.createLink(vm.project.shortName, project.shortName).then(function () {
            vm.loadContents();
            $mdDialog.hide();
        });
    };

    vm.getLink = function (content) {
        if (content.contentType === 'cmis:document') {
            return '#!/dokument/' + content.shortRef;
        }
        if (content.contentType === 'cmis:folder') {
            return '#!/projekter/' + vm.project.shortName + vm.documentTab + vm.path + '/' + content.name;
        }
        if (content.contentType === 'cmis:link') {
            return '#!/projekter/' + content.destination_link;
        }
    }

    vm.loadFromSbsys = function () {

        siteService.loadFromSbsys().then(function () {
            vm.loadContents();
            $mdDialog.hide();
        });
    };


    vm.uploadSbsys = function () {
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

    vm.newTemplateDialog = function (event,template) {
        vm.newTemplateName = template.name;

        $mdDialog.show({
            controller: ['$scope', 'template', function ($scope, template) {
                $scope.template = template;
            }],
            templateUrl: 'app/src/sites/view/newTemplate.tmpl.html',
            locals: {
                template: template
            },
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true,
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
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    vm.uploadNewVersion = function (file, nodeRef) {
        documentService.getDocument(nodeRef).then(function (response) {

            var cmisQuery = response.item.location.site + "/documentLibrary/" + response.item.location.path

            cmisService.getNode(cmisQuery).then(function (val) {

                var currentFolderNodeRef = val.data.properties["alfcmis:nodeRef"].value;

                siteService.uploadNewVersion(file, currentFolderNodeRef, response.item.nodeRef).then(function (response) {
                    vm.loadContents();
                });

                $mdDialog.cancel();
            });
        });
    };


    vm.uploadNewVersionDialog = function (event, nodeRef) {
        $scope.nodeRef = nodeRef.replace("workspace://SpacesStore/", "")

        $mdDialog.show({
            templateUrl: 'app/src/sites/view/uploadNewVersion.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    vm.selectFile = function (event) {
        var file = event.target.value;
        var fileName = file.replace(/^C:\\fakepath\\/, "");
        document.getElementById("uploadFile").innerHTML = fileName;
    };


    vm.reviewDocumentsDialog = function (event, nodeRef) {
        $scope.nodeRef = nodeRef;

        $mdDialog.show({
            templateUrl: 'app/src/sites/view/reviewDocument.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    vm.deleteFileDialog = function (event, content) {
        $mdDialog.show({
            controller: ['$scope', 'content', function ($scope, content) {
                $scope.content = content;
            }],
            templateUrl: 'app/src/sites/view/deleteFile.tmpl.html',
            locals: {
                content: content
            },
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    vm.reviewDocument = function (document, reviewer, comment) {

    };


    function deleteFile(nodeRef) {
        siteService.deleteFile(nodeRef).then(function (response) {
            loadSiteData();
            $mdDialog.hide();
        });
    }

    vm.deleteLink = function (source, destination) {
        siteService.deleteLink(source, destination).then(function () {
            vm.loadContents();
            $mdDialog.hide();
        });
    };


    function createNotification(userName, subject, message, link, wtype, project) {
        console.log('creating notification...');
        notificationsService.addNotice(userName, subject, message, link, wtype, project).then(function (val) {
            $mdDialog.hide();
        });
    }


    function createSiteNotification(userName, site) {
        console.log('create notification');
        console.log(vm.project);
        var subject = "Du er blevet tilføjet til " + vm.project.title;
        var message = "har tilføjet dig til projektet " + vm.project.title + ".";
        var link = "#!/projekter/" + site + "?type=Project";
        createNotification(userName, subject, message, link, 'project', site);
    }


    function createDocumentNotification(projekt, shortName, ref, fileName) {
        var creatorFullName = vm.currentUser.firstName + " " + vm.currentUser.lastName;;
        var subject = "Nyt dokument i " + projekt;
        var message = "Et nyt dokument \"" + fileName + "\" er blevet uploadet af " + creatorFullName;
        var link = "#!/dokument/" + ref;

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
                        createNotification(userName, subject, message, link, 'new-doc', shortName);
                    }
                });
            }
        });
    }


    vm.createReviewNotification = function (documentNodeRef, userName, message, project) {
        var creator = vm.currentUser.userName;
        var s = documentNodeRef.split("/");
        var ref = (s[3]);
        var link = "#!/dokument/" + ref + "?dtype=wf" + "&from=" + creator;

        var sub = "Review forespørgsel";
        createNotification(userName, sub, message, link, 'review-request', project.shortName);
    };


    function loadMembers() {
        siteService.getSiteMembers(vm.project.shortName).then(function (val) {
            $scope.members = val;
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
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };


    vm.upload = function (files) {
        for (var i = 0; i < files.length; i++) {
            siteService.uploadFiles(files[i], vm.currentFolderNodeRef).then(function (response) {
                vm.loadContents();
                var ref = response.data.nodeRef.split("/")[3];
                console.log(response.data.fileName);

                // dont use the project title - it will fail if there is more than one project with that name - and we allow that...
                createDocumentNotification(vm.project.title, vm.project.shortName, ref, response.data.fileName);
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
            function () {
                vm.removeMemberFromSite(siteName, userName);
            },
            function () {
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
        console.log("vm.parentId");
        console.log(vm.parentId);

        console.log("nodeRef");
        console.log(nodeRef);

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


    vm.renameDocumentDialog = function (event, content) {
        vm.newFileName = content.name;

        $mdDialog.show({
            controller: ['$scope', 'content', function ($scope, content) {
                $scope.content = content;
            }],
            templateUrl: 'app/src/sites/view/renameFile.tmpl.html',
            locals: {
                content: content
            },
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
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
            } else {
                return [];
            }
        });
    };


    vm.gotoPath = function (nodeRef) {

        var ref = nodeRef;

        documentService.getPath(ref.split("/")[3]).then(function (val) {

            $scope.selectedDocumentPath = val.container;

            var path = ref.replace("workspace://SpacesStore/", "");
            $window.location.href = "/#!/dokument/" + path;

        });
    };


    //Goes to the libreOffice online edit page
    function goToLOEditPage(nodeRef, fileName) {
        //console.log('Transitioning to the LOOL page with nodeRef: ' + nodeRef);
        $state.go('lool', {
            'nodeRef': nodeRef,
            'fileName': fileName
        });
    };

    function editSiteDialog(ev) {
        $mdDialog.show({
            templateUrl: 'app/src/sites/view/renameSite.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }


    function updateSiteName() {
        console.log('jeg er ' + vm.project.visibility);
        siteService.updateSiteName(vm.project.shortName, vm.project.title, vm.project.description,vm.project.visibility).then(
            function (result) {
                console.log('kig her');
                console.log(result);
                vm.project.title = result.title;
                vm.project.description = result.description;
                vm.project.visibility = result.visibility;
                $mdDialog.hide();
                loadSiteData();
            }
        );
    }

    function createDocumentFromTemplate(template_name,template_id) {
        siteService.createDocumentFromTemplate(template_id, vm.currentFolderNodeRef, template_name).then(function (response) {
            var ref = response.data[0].nodeRef.split("/")[3];
            createDocumentNotification(vm.project.title, vm.project.shortName, ref, response.data[0].fileName);
            loadSiteData();
        });
    }
}


//TODO: refactor all the methods that dont belong here to a relevant server- and pass on the call to them in the controller