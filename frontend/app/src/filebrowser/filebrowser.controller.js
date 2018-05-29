'use strict';

angular
    .module('openDeskApp.filebrowser')
    .controller('FilebrowserController', FilebrowserController);
    
    function FilebrowserController($window, $state, $stateParams, $scope, $rootScope, $mdDialog, $mdToast, $timeout, Upload,
        siteService, fileUtilsService, filebrowserService, filterService, alfrescoDownloadService,
        documentPreviewService, documentService, alfrescoNodeUtils, userService, $translate, APP_BACKEND_CONFIG,
        sessionService, headerService, browserService, notificationsService, editOnlineMSOfficeService) {
            
        var vm = this;
        var documentNodeRef = "";
        var folderNodeRef = "";
        var sendAllToSbsys = false;
        
        vm.cancelDialog = cancelDialog;
        vm.cancelSbsysDialog = cancelSbsysDialog;
        vm.contentList = [];
        vm.contentListLength = 0;
        vm.deleteContentDialog = deleteContentDialog;
        vm.createProjectLink = createProjectLink;
        vm.deleteFile = deleteFile;
        vm.deleteLink = deleteLink;
        vm.documentTemplates = {};
        vm.enableESDH = APP_BACKEND_CONFIG.enableESDH;
        vm.error = false;
        vm.folderTemplates = {};
        vm.getLink = getLink;
        vm.isLoading = true;
        vm.loadCheckboxes = loadCheckboxes;
        vm.loadFromSbsys = loadFromSbsys;
        vm.loadHistory = loadHistory;
        vm.loadSbsysDialog = loadSbsysDialog;
        vm.getAvatarUrl = getAvatarUrl;
        vm.newLinkDialog = newLinkDialog;
        vm.permissions = {};
        vm.renameContent = renameContent;
        vm.renameContentDialog = renameContentDialog;
        vm.searchProjects = searchProjects;
        vm.setAllCheckboxes = setAllCheckboxes;
        vm.shareDocument = shareDocument;
        vm.shareDocumentDialog = shareDocumentDialog;
        vm.stopSharingDocument = stopSharingDocument;
        vm.searchPeople = searchPeople;
        vm.uploading = false;
        vm.uploadDocumentsDialog = uploadDocumentsDialog;
        vm.uploadFiles = uploadFiles;
        vm.uploadNewVersion = uploadNewVersion;
        vm.uploadNewVersionDialog = uploadNewVersionDialog;
        vm.uploadSbsys = uploadSbsys;
        vm.uploadSbsysDialog = uploadSbsysDialog;
        vm.searchUsers = searchUsers;
        vm.sendToSbsys = false;

        
    $scope.isSite = $stateParams.isSite;

    $scope.siteService = siteService;
    $scope.history = [];
    $scope.uploadedToSbsys = false;
    $scope.showProgress = false;
    $scope.reverse = false;
    $scope.order = 'name';

    //de her er dublikeret i document.controller!
    $scope.downloadDocument = downloadDocument;
    vm.editInMSOffice = editInMSOffice;
    vm.editInLibreOffice = editInLibreOffice;
    vm.editInOnlyOffice = editInOnlyOffice;
    $scope.previewDocument = previewDocument;
    vm.reviewDocumentsDialog = reviewDocumentsDialog;
    vm.createReviewNotification = createReviewNotification;

    $scope.filesToFilebrowser = null;

    $scope.$on('updateFilebrowser', function() {
        activate();
    });   

    $scope.$watch('filesToFilebrowser', function () {
        if ($scope.filesToFilebrowser !== null) {
            $scope.files = $scope.filesToFilebrowser;
            vm.uploadFiles($scope.files);
        }
    });

    activate();

    function activate() {
        vm.path = $stateParams.path;
        if($stateParams.selectedTab !== undefined)
            $scope.tab.selected = $stateParams.selectedTab;

        if ($scope.isSite) {
            $scope.$watch('siteService.getUserManagedProjects()', function (newVal) {
                $scope.userManagedProjects = newVal;
            });
            siteService.getNode($stateParams.projekt, "documentLibrary", vm.path).then(function (val) {
                setFolder(val.parent.nodeRef);
            });

            vm.permissions = siteService.getPermissions();
            if(vm.permissions === undefined) {
                siteService.getSiteUserPermissions($stateParams.projekt).then(function(permissions) {
                    vm.permissions = permissions;
                });
            }
        }
        else if($stateParams.nodeRef !== undefined && $stateParams.nodeRef !== "") {
            setFolderAndPermissions($stateParams.nodeRef);
        }
        else if ($stateParams.type === "shared-docs") {
            var title = $translate.instant('DOCUMENT.SHARED_WITH_ME');
            browserService.setTitle(title);
            headerService.setTitle(title);
            loadSharedNodes();
        }
        else if($stateParams.type === "my-docs") {
            var title;
            title = $translate.instant('DOCUMENT.MY_DOCUMENTS');
            browserService.setTitle(title);
            headerService.setTitle(title);
            filebrowserService.getUserHome().then(function (userHomeRef) {
                var userHomeId = alfrescoNodeUtils.processNodeRef(userHomeRef).id;
                setFolderAndPermissions(userHomeId);
            });
        }
        else {
            setFolderAndPermissionsByPath(vm.path);
        }

        filebrowserService.getTemplates("Document").then(function (documentTemplates) {
            vm.documentTemplates = documentTemplates;
            if (vm.documentTemplates !== undefined)
                processContent(vm.documentTemplates);
        });

        filebrowserService.getTemplates("Folder").then(function (folderTemplates) {
            vm.folderTemplates = folderTemplates;
            vm.folderTemplates.unshift({
                nodeRef: null,
                name: $translate.instant('COMMON.EMPTY') + " " + $translate.instant('COMMON.FOLDER'),
                isFolder: true
            });
        });
    }

    function setFolderAndPermissionsByPath(path) {
        filebrowserService.getCompanyHome().then(function (val) {
            var companyHomeId = alfrescoNodeUtils.processNodeRef(val).id;
            setFolderAndPermissions(companyHomeId + path);
        });
    }

    function setFolderAndPermissions(node) {
        documentService.getDocumentByPath(node).then(
            function (response) {
                setFolder(response.metadata.parent.nodeRef);
                vm.permissions.canEdit = response.metadata.parent.permissions.userAccess.edit;
            },
            function (error) {
                vm.isLoading = false;
                vm.error = true;
            }
        );
    }

    function setFolder(fNodeRef) {
        filebrowserService.setCurrentFolder(fNodeRef);
        folderNodeRef = fNodeRef;
        var folder = alfrescoNodeUtils.processNodeRef(folderNodeRef).id;
        loadContentList(folder);
    }

    function loadContentList(folderUUID) {
        filebrowserService.getContentList(folderUUID).then(
            function (contentList) {
                loadNodes(contentList);
            },
            function (error) {
                vm.isLoading = false;
                vm.error = true;
            }
        );
    }

    function loadSharedNodes() {
        filebrowserService.getSharedNodes().then(
            function (contentList) {
                loadNodes(contentList);
            },
            function (error) {
                vm.isLoading = false;
                vm.error = true;
            }
        );
    }

    function loadNodes(contentList) {
        vm.contentList = contentList;

        angular.forEach(vm.contentList, function(contentTypeList) {
            vm.contentListLength += contentTypeList.length;
            processContent(contentTypeList);
        });
        // Compile paths for breadcrumb directive
        if(folderNodeRef !== "") {
            buildBreadCrumbPath();
        }
        vm.isLoading = false;
    }

    function processContent(content) {
        angular.forEach(content, function(item) {
            item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimeType, 24);

            var isLocked = item.isLocked;
            var lockType;
            if(isLocked)
                lockType = item.lockType;
            var mimeType = item.mimeType;

            item.loolEditable = documentService.isLibreOfficeEditable(mimeType, isLocked);
            item.msOfficeEditable = documentService.isMsOfficeEditable(mimeType, isLocked);
            item.onlyOfficeEditable = documentService.isOnlyOfficeEditable(mimeType, isLocked, lockType);
        });
    }
    
    function getLink(content) {
        if (content.contentType === 'cmis:document') {
            if ($stateParams.type === "text-templates")
                return 'systemsettings.text_template_edit({doc: "' + content.shortRef + '"})';
            else
                return 'document({doc: "' + content.shortRef + '"})';
        }
        if (content.contentType === 'cmis:folder') {
            if ($stateParams.type === "system-folders")
                return 'systemsettings.filebrowser({path: "' + vm.path + '/' + content.name + '"})';
            else if ($stateParams.type === "my-docs")
                return 'odDocuments.myDocs({nodeRef: "' + content.shortRef + '"})';
            else if ($stateParams.type === "shared-docs")
                return 'odDocuments.sharedDocs({nodeRef: "' + content.shortRef + '"})';
            else if($scope.isSite)
                return 'project.filebrowser({projekt: "' + $stateParams.projekt +
                    '", path: "' + vm.path + '/' + content.name + '"})';
        }
        if (content.contentType === 'cmis:link') {
            return 'project({projekt: "' + content.destination_link + '"})';
        }
    }
    
    function loadHistory(doc) {
        documentService.getHistory(doc).then(function (val) {
            $scope.history = val;
        });
    }

    function buildBreadCrumbPath() {

        if ($stateParams.type === "my-docs" || $stateParams.type === "shared-docs") {
            var homeType;
            switch($stateParams.type) {
                case "my-docs":
                    homeType = "user";
                    break;
                case "shared-docs":
                    homeType = "company";
                    break;
            }

            filebrowserService.getHome(homeType).then(function (rootRef) {
                documentService.getBreadCrumb($stateParams.type, folderNodeRef, rootRef).then(
                    function (breadcrumb) {
                        vm.paths = breadcrumb;
                    });
            });
        }

        else if (vm.path !== undefined) {
            var homeLink;

            if ($scope.isSite)
                homeLink = 'project.filebrowser({projekt: "' + $stateParams.projekt + '", path: ""})';
            else
                homeLink = 'systemsettings.filebrowser({path: ""})';

            var paths = [{
                title: 'Home',
                link: homeLink
            }];
            var pathLink = '/';
            createBreadCrumbs(paths, pathLink);
            vm.paths = paths;
        }
    }

    function createBreadCrumbs(paths, pathLink) {
        var pathArr = vm.path.split('/');
        for (var a in pathArr) {
            if (pathArr[a] !== '') {
                var link;
                if ($scope.isSite)
                    link = 'project.filebrowser({projekt: "' + $stateParams.projekt +
                        '", path: "' + pathLink + pathArr[a] + '"})';
                else
                    link = 'systemsettings.filebrowser({path: "' + pathLink + pathArr[a] + '"})';
                paths.push({
                    title: pathArr[a],
                    link: link
                });
                console.log($stateParams.nodeRef);
                console.log("Added link: " + link);
                pathLink = pathLink + pathArr[a] + '/';
            }
        }
    }

    // Dialogs
    
    function cancelDialog() {
        $mdDialog.cancel();
        $scope.files = [];
    }

    function hideDialogAndReloadContent() {
        vm.uploading = false;
        $rootScope.$broadcast('updateFilebrowser');
        cancelDialog();
    }

    // Documents
    
    function uploadDocumentsDialog(event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/uploadDocuments.tmpl.html',
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }


    function uploadFiles(files) {
        vm.uploading = true;

        angular.forEach(files, function (file) {
            siteService.uploadFiles(file, folderNodeRef).then(function (response) {
                if ($scope.isSite) {
                    siteService.createDocumentNotification(response.data.nodeRef, response.data.fileName);
                }
                hideDialogAndReloadContent();
            });
        });

        $scope.files = [];
    }

    
    function downloadDocument(nodeRef, name) {
        alfrescoDownloadService.downloadFile(nodeRef, name);
    }

    
    function previewDocument(nodeRef) {
        documentPreviewService.previewDocument(nodeRef);
    }

    function editInLibreOffice(nodeRef, fileName) {
        var params = {
            'nodeRef': nodeRef,
            'fileName': fileName
        };
        $state.go('lool', params);
    }

    function editInMSOffice(nodeRef) {
        var nodeId = alfrescoNodeUtils.processNodeRef(nodeRef).id;
        documentService.getDocument(nodeId).then(function (response) {
            var doc = response.item;
            var docMetadata = response.metadata;
            editOnlineMSOfficeService.editOnline(undefined, doc, docMetadata);
        });
    }

    function editInOnlyOffice(nodeRef) {
        var nodeId = alfrescoNodeUtils.processNodeRef(nodeRef).id;
        $window.open($state.href('onlyOfficeEdit', {'nodeRef': nodeId }));
    }
    
    function reviewDocumentsDialog(event, nodeRef) {
        documentNodeRef = nodeRef;

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/reviewDocument.tmpl.html',
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }

    function searchUsers(filter) {
        return userService.getUsers(filter);
    }

    function createReviewNotification(userName, comment) {
        siteService.createReviewNotification(documentNodeRef, userName, comment);
        $mdDialog.cancel();
    }

    function getAvatarUrl (user) {
        return sessionService.makeAvatarUrl(user);
    }

    function shareDocumentDialog(content) {
        documentNodeRef = content.nodeRef;
        $scope.content = content;

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/shareDocument.tmpl.html',
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }

    function shareDocument(user, permission) {
        filebrowserService.shareNode(documentNodeRef, user.userName, permission).then(
            function(succes) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Dokumentet blev delt med ' + user.displayName + ".")
                        .hideDelay(3000)
                );
                var nodeId = alfrescoNodeUtils.processNodeRef(documentNodeRef).id;
                var link = "dokumenter/delte/" + nodeId;
                var subject = 'Nyt dokument delt';
                var message = "En bruger har delt et dokument med dig";

                notificationsService.addNotice(
                    user.userName,
                    subject,
                    message,
                    link,
                    "new-shared-doc",
                    ""
                );
            }
        );
    }

    function stopSharingDocument(user, permission) {
        filebrowserService.stopSharingNode(documentNodeRef, user.userName, permission).then(
            function(succes) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Dokumentet bliver ikke længere delt med ' + user.displayName + ".")
                        .hideDelay(3000)
                );
            }
        );
    }

    function searchPeople(query) {
        if (query) {
            return userService.getUsers(query);
        }
    }

    
    function uploadNewVersionDialog(event, nodeRef) {
        documentNodeRef = nodeRef;

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/uploadNewVersion.tmpl.html',
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }

    
    function uploadNewVersion(file) {
        vm.uploading = true;
        siteService.uploadNewVersion(file, folderNodeRef, documentNodeRef).then(function (val) {
            hideDialogAndReloadContent();
        });
    }

    function renameContentDialog(event, content) {
        documentNodeRef = content.nodeRef;
        // $scope.newContentName = content.name;

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/renameContent.tmpl.html',
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }
    
    function renameContent(newName) {
        var props = {
            prop_cm_name: newName
        };
        siteService.updateNode(documentNodeRef, props).then(function (val) {
            hideDialogAndReloadContent();
        });
    }

    // We tried to have genericContentDialog inside the scope, but after having shown the dialog once the method was
    // missing from the scope.
    $scope.moveContentDialog = moveContentDialog;
    $scope.copyContentDialog = copyContentDialog;
    
    function moveContentDialog(event, sourceNodeRef, parentNodeRef) {
        genericContentDialog("MOVE", sourceNodeRef, parentNodeRef);
    }

    function copyContentDialog(event, sourceNodeRef, parentNodeRef) {
        genericContentDialog("COPY", sourceNodeRef, parentNodeRef);
    }

    function genericContentDialog (action, sourceNodeRef, parentNodeRef) {
        var sourceNodeRefs = [];
        sourceNodeRefs.push(sourceNodeRef);

        var data = {
            parentNodeRef: parentNodeRef,
            contentAction: action,
            sourceNodeRefs: sourceNodeRefs
        };

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/genericDialog/genericContentDialog.view.html',
            controller: 'GenericContentDialogController',
            controllerAs: 'vm',
            locals: {
                data: data
            },
            clickOutsideToClose: true
        });
    }
    
    function deleteContentDialog(event, content) {
        $scope.content = content;
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/deleteContent.tmpl.html',
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }
    
    function deleteFile(nodeRef) {
        siteService.deleteFile(nodeRef).then(function (response) {
            hideDialogAndReloadContent();
        });
    }

    function deleteLink(source, destination) {
        siteService.deleteLink(source, destination).then(function () {
            hideDialogAndReloadContent();
        });
    }

    // Link

    function newLinkDialog(event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/link/newProjectLink.tmpl.html',
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    function createProjectLink(project) {
        siteService.createProjectLink(project.shortName).then(function () {
            hideDialogAndReloadContent();
        });
    }
    
    function searchProjects(query) {
        return filterService.search($scope.userManagedProjects, {
            title: query
        });
    }

    // SBSYS
    
    function loadSbsysDialog(event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/sbsys/loadSbsys.tmpl.html',
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    function loadFromSbsys() {
        filebrowserService.loadFromSbsys(folderNodeRef).then(function () {
            hideDialogAndReloadContent();
        });
    }
    
    function uploadSbsysDialog(event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/sbsys/uploadSbsys.tmpl.html',
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }
    
    function cancelSbsysDialog() {
        $scope.showProgress = false;
        $scope.uploadedToSbsys = false;
        $mdDialog.cancel();
    }
    
    function uploadSbsys() {
        $scope.showProgress = true;
        $timeout(setSbsysShowAttr, 2500);
    }
    
    function loadCheckboxes() {
        vm.sendToSbsys = false;
        vm.contentList.forEach(function (contentTypeList) {
            contentTypeList.forEach(function (content) {
                vm.sendToSbsys = vm.sendToSbsys | content.sendToSbsys;
            });
        });
    }
    
    function setAllCheckboxes() {
        vm.contentList.forEach(function (contentTypeList) {
            contentTypeList.forEach(function (content) {
                content.sendToSbsys = sendAllToSbsys;
            });
        });
        vm.sendToSbsys = sendAllToSbsys;
    }

    function setSbsysShowAttr() {
        $scope.showProgress = false;
        $scope.uploadedToSbsys = true;
    }
}