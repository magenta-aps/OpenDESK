'use strict';

angular
    .module('openDeskApp.filebrowser', ['ngFileUpload'])
    .controller('FilebrowserController', FilebrowserController);
    
    function FilebrowserController($state, $stateParams, $scope, $mdDialog, $timeout, Upload, siteService, fileUtilsService,
        filebrowserService, filterService, alfrescoDownloadService, documentPreviewService, documentService, 
        alfrescoNodeUtils, $translate, APP_BACKEND_CONFIG) {
            
        var vm = this;
        var documentNodeRef = "";
        var folderNodeRef = "";
        var folderUUID = "";
        
        vm.cancelDialog = cancelDialog;
        vm.createFolder = createFolder;
        vm.cancelSbsysDialog = cancelSbsysDialog;
        vm.createContentFromTemplateDialog = createContentFromTemplateDialog;
        vm.createContentFromTemplate = createContentFromTemplate;
        vm.deleteContentDialog = deleteContentDialog;
        vm.createProjectLink = createProjectLink;
        vm.deleteFile = deleteFile;
        vm.deleteLink = deleteLink;
        vm.enableESDH = APP_BACKEND_CONFIG.enableESDH;
        vm.folderTemplates = {};
        vm.getLink = getLink;
        vm.loadCheckboxes = loadCheckboxes;
        vm.loadFromSbsys = loadFromSbsys;
        vm.loadHistory = loadHistory;
        vm.loadSbsysDialog = loadSbsysDialog;
        vm.newLinkDialog = newLinkDialog;
        vm.permissions = siteService.getPermissions();
        vm.renameContent = renameContent;
        vm.renameContentDialog = renameContentDialog;
        vm.searchProjects = searchProjects;
        vm.setAllCheckboxes = setAllCheckboxes;
        vm.uploading = false;
        vm.uploadDocumentsDialog = uploadDocumentsDialog;
        vm.uploadFiles = uploadFiles;
        vm.uploadNewVersion = uploadNewVersion;
        vm.uploadNewVersionDialog = uploadNewVersionDialog;
        vm.uploadSbsys = uploadSbsys;
        vm.uploadSbsysDialog = uploadSbsysDialog;
        
    $scope.isSite = $stateParams.isSite;

    $scope.siteService = siteService;
    $scope.contentList = [];
    $scope.contentListLength = 0;
    $scope.isLoading = true;
    $scope.history = [];
    $scope.documentTemplates = {};
    // $scope.newContentName = "";
    $scope.primitives = {};
    $scope.primitives.sendToSbsys = false;
    $scope.primitives.sendAllToSbsys = false;
    $scope.uploadedToSbsys = false;
    $scope.showProgress = false;
    $scope.error = false;

    
    //de her er dublikeret i document.controller!
    $scope.downloadDocument = downloadDocument;
    $scope.previewDocument = previewDocument;
    $scope.goToLOEditPage = goToLOEditPage;
    vm.reviewDocumentsDialog = reviewDocumentsDialog;
    vm.createReviewNotification = uploadNewVersionDialog;

    $scope.filesToFilebrowser = null;

    $scope.$watch('filesToFilebrowser', function () {
        if ($scope.filesToFilebrowser !== null) {
            $scope.files = $scope.filesToFilebrowser;
            vm.uploadFiles($scope.files);
        }
    });

    if ($scope.isSite) {
        $scope.tab.selected = $stateParams.selectedTab;
        $scope.$watch('siteService.getSite()', function (newVal) {
            $scope.site = newVal;
        });
        $scope.$watch('siteService.getUserManagedProjects()', function (newVal) {
            $scope.userManagedProjects = newVal;
        });
        siteService.getNode($stateParams.projekt, "documentLibrary", $stateParams.path).then(function (val) {
            setFolder(val.parent.nodeRef);
        });
    } else {
        setFolderAndPermissions($stateParams.path);
    }

    activate();

    function activate() {

        filebrowserService.getTemplates("Document").then(function (response) {
            $scope.documentTemplates = response;
            if ($scope.documentTemplates !== undefined)
                processContent($scope.documentTemplates);
        });

        filebrowserService.getTemplates("Folder").then(function (response) {
            vm.folderTemplates = response;
            vm.folderTemplates.unshift({
                nodeRef: null,
                name: $translate.instant('COMMON.EMPTY') + " " + $translate.instant('COMMON.FOLDER')
            });
        });
    }

    function setFolderAndPermissions(path) {
        filebrowserService.getCompanyHome().then(function (val) {
            var companyHomeUri = alfrescoNodeUtils.processNodeRef(val).uri;
            filebrowserService.getNode(companyHomeUri, path).then(
                function (response) {
                    setFolder(response.metadata.parent.nodeRef);
                    vm.permissions.canEdit = response.metadata.parent.permissions.userAccess.edit;
                },
                function (error) {
                    $scope.isLoading = false;
                    $scope.error = true;
                }
            );
        });
    }

    function setFolder(fNodeRef) {
        folderNodeRef = fNodeRef;
        folderUUID = alfrescoNodeUtils.processNodeRef(folderNodeRef).id;
        loadContentList();
    }

    function loadContentList() {
        filebrowserService.getContentList(folderUUID).then(
            function (response) {
                $scope.contentList = response;
                $scope.contentList.forEach(function (contentTypeList) {
                    $scope.contentListLength += contentTypeList.length;
                    processContent(contentTypeList);
                });

                // Compile paths for breadcrumb directive
                $scope.paths = buildBreadCrumbPath();

                $scope.isLoading = false;
            },
            function (error) {
                $scope.isLoading = false;
                $scope.error = true;
            }
        );
    }

    function processContent(content) {
        content.forEach(function (item) {
            item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimeType, 24);
            item.loolEditable = documentService.isLoolEditable(item.mimeType);
            item.msOfficeEditable = documentService.isMsOfficeEditable(item.mimeType);
        });
    }
    
    function getLink(content) {
        if (content.contentType === 'cmis:document') {
            return 'document({doc: "' + content.shortRef + '"})';
        }
        if (content.contentType === 'cmis:folder') {
            if ($scope.isSite)
                return 'project.filebrowser({projekt: "' + $stateParams.projekt +
                    '", path: "' + $stateParams.path + '/' + content.name + '"})';
            else
                return 'systemsettings.filebrowser({path: "' + $stateParams.path + '/' + content.name + '"})';
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
        var homeLink;
        if ($scope.isSite)
            homeLink = 'project.filebrowser({projekt: "' + $stateParams.projekt + '", path: ""})';
        else
            homeLink = 'systemsettings.filebrowser({path: ""})';

        var paths = [{
            title: 'Home',
            link: homeLink
        }];

        if ($stateParams.path !== undefined) {
            var pathArr = $stateParams.path.split('/');
            var pathLink = '/';
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
                    pathLink = pathLink + pathArr[a] + '/';
                }
            }
        }
        return paths;
    }

    // Dialogs
    
    function cancelDialog() {
        $mdDialog.cancel();
        $scope.files = [];
    }

    function hideDialogAndReloadContent() {
        vm.uploading = false;
        loadContentList();
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

    
    function goToLOEditPage(nodeRef, fileName) {
        $state.go('lool', {
            'nodeRef': nodeRef,
            'fileName': fileName
        });
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

    
    function createReviewNotification(userName, comment) {
        siteService.createReviewNotification(documentNodeRef, userName, comment);
        $mdDialog.cancel();
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
            vm.uploading = false;
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

    // Templates

    function createContentFromTemplateDialog(event, template, contentType) {
        $scope.template = template;
        // $scope.newContentName = template.name;

        if (template.nodeRef === null) {
            $mdDialog.show({
                templateUrl: 'app/src/filebrowser/view/content/folder/newFolder.tmpl.html',
                targetEvent: event,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true
            });
        } else {
            $scope.contentType = contentType;
            $mdDialog.show({
                templateUrl: 'app/src/filebrowser/view/content/createContentFromTemplateDialog.tmpl.html',
                targetEvent: event,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true
            });
        }
    }
    
    function createFolder(folderName) {
        var props = {
            prop_cm_name: folderName,
            prop_cm_title: folderName,
            alf_destination: folderNodeRef
        };
        siteService.createFolder("cm:folder", props).then(function (response) {
            hideDialogAndReloadContent();
        });
    }
    
    function createContentFromTemplate(template_name, template_id) {
        filebrowserService.createContentFromTemplate(template_id, folderNodeRef, template_name).then(function (response) {
            if ($scope.isSite) {
                siteService.createDocumentNotification(response.data[0].nodeRef, response.data[0].fileName);
            }
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
        $scope.primitives.sendToSbsys = false;
        $scope.contentList.forEach(function (contentTypeList) {
            contentTypeList.forEach(function (content) {
                $scope.primitives.sendToSbsys = $scope.primitives.sendToSbsys | content.sendToSbsys;
            });
        });
    }
    
    function setAllCheckboxes() {
        $scope.contentList.forEach(function (contentTypeList) {
            contentTypeList.forEach(function (content) {
                content.sendToSbsys = $scope.primitives.sendAllToSbsys;
            });
        });
        $scope.primitives.sendToSbsys = $scope.primitives.sendAllToSbsys;
    }

    function setSbsysShowAttr() {
        $scope.showProgress = false;
        $scope.uploadedToSbsys = true;
    }
}