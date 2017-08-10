angular
    .module('openDeskApp.filebrowser')
    .controller('FilebrowserController', FilebrowserController);

function FilebrowserController($state, $stateParams, $scope, $mdDialog, siteService, fileUtilsService,
                               filebrowserService, filterService, alfrescoDownloadService, documentPreviewService,
                               userService, documentService, alfrescoNodeUtils, $translate, APP_CONFIG) {

    $scope.config = APP_CONFIG;
    $scope.isSite = $stateParams.isSite;

    $scope.siteService = siteService;
    $scope.folderNodeRef = "";
    $scope.folderUUID = "";
    $scope.contentList = [];
    $scope.contentListLength = 0;
    $scope.isLoading = true;

    $scope.history = [];
    $scope.documentTab = '/dokumenter';

    $scope.folderTemplates = {};
    $scope.documentTemplates = {};
    $scope.newContentName = "";

    $scope.primitives = {};
    $scope.primitives.sendToSbsys = false;
    $scope.uploadedToSbsys = false;
    $scope.showProgress = false;

    $scope.permissions = {};
    $scope.documentNodeRef = "";

    $scope.error = false;

    if($scope.isSite) {
        $scope.tab.selected = $stateParams.selectedTab;
        $scope.$watch('siteService.getSite()', function (newVal) {
            $scope.site = newVal;
        });
        $scope.$watch('siteService.getPermissions()', function (newVal) {
            $scope.permissions = newVal;
        });
        $scope.$watch('siteService.getUserManagedProjects()', function (newVal) {
            $scope.userManagedProjects = newVal;
        });
        siteService.getNode($stateParams.projekt, "documentLibrary", $stateParams.path).then(function (val) {
            setFolder(val.parent.nodeRef);
        });
    }
    else
        setFolderAndPermissions($stateParams.path);

    filebrowserService.getTemplates("Document").then(function (response) {
        $scope.documentTemplates = response;

        if($scope.documentTemplates != undefined)
            addThumbnailUrl($scope.documentTemplates);
    });

    filebrowserService.getTemplates("Folder").then(function (response) {
        $scope.folderTemplates = response;
        $scope.folderTemplates.unshift({
            nodeRef: null,
            name: $translate.instant('COMMON.EMPTY') + " " + $translate.instant('COMMON.FOLDER')
        });
    });

    function setFolderAndPermissions(path) {

        filebrowserService.getCompanyHome().then(function (val) {
            var companyHomeUri = alfrescoNodeUtils.processNodeRef(val).uri;
            filebrowserService.getNode(companyHomeUri, path).then(
                function (response) {
                    setFolder(response.metadata.parent.nodeRef);
                    $scope.permissions.canEdit = response.metadata.parent.permissions.user.Write;
                },
                function (error) {
                    $scope.isLoading = false;
                    $scope.error = true;
                }
            );
        });
    }

    function setFolder(folderNodeRef) {
        $scope.folderNodeRef = folderNodeRef;
        $scope.folderUUID = alfrescoNodeUtils.processNodeRef(folderNodeRef).id;
        loadContentList();
    }

    function loadContentList() {
        filebrowserService.getContentList($scope.folderUUID).then(
            function (response) {
                $scope.contentList = response;
                $scope.contentList.forEach(function (contentTypeList) {
                    $scope.contentListLength += contentTypeList.length;
                    addThumbnailUrl(contentTypeList);
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

    function addThumbnailUrl(files) {
        files.forEach(function (item) {
            item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimeType, 24);
        });
    }

    $scope.searchUsers = function (filter) {
        return userService.getUsers(filter);
    };

    $scope.getLink = function (content) {
        if (content.contentType === 'cmis:document') {
            return 'document({doc: "' + content.shortRef + '"})';
        }
        if (content.contentType === 'cmis:folder') {
            if($scope.isSite)
                return 'project.filebrowser({projekt: "' + $stateParams.projekt +
                    '", path: "' + $stateParams.path + '/' + content.name + '"})';
            else
                return 'systemsettings.filebrowser({path: "' + $stateParams.path + '/' + content.name + '"})';
        }
        if (content.contentType === 'cmis:link') {
            return 'project({projekt: "' + content.destination_link + '"})';
        }
    };

    $scope.loadHistory = function (doc) {
        documentService.getHistory(doc).then(function (val) {
            $scope.history = val;
        });
    };

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

        if ($stateParams.path != undefined) {
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

    $scope.cancelDialog = function () {
        $mdDialog.cancel();
    };

    function hideDialogAndReloadContent () {
        loadContentList();
        $mdDialog.hide();
    }

    // Documents

    $scope.uploadDocumentsDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/uploadDocuments.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    $scope.uploadFiles = function (files) {
        for (var i = 0; i < files.length; i++) {
            siteService.uploadFiles(files[i], $scope.folderNodeRef).then(function (response) {
                if($scope.isSite) {
                    siteService.createDocumentNotification(response.data.nodeRef, response.data.fileName);
                }
                hideDialogAndReloadContent();
            });
        }
    };

    $scope.downloadDocument = function downloadDocument(nodeRef, name) {
        alfrescoDownloadService.downloadFile(nodeRef, name);
    };

    $scope.previewDocument = function previewDocument(nodeRef) {
        documentPreviewService.previewDocument(nodeRef);
    };

    $scope.goToLOEditPage = function (nodeRef, fileName) {
        $state.go('lool', {
            'nodeRef': nodeRef,
            'fileName': fileName
        });
    };

    $scope.reviewDocumentsDialog = function (event, nodeRef) {
        $scope.documentNodeRef = nodeRef;

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/reviewDocument.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    $scope.createReviewNotification = function (userName, comment) {
        siteService.createReviewNotification($scope.reviewNodeRef, userName, comment);
        $mdDialog.hide();
    };

    $scope.uploadNewVersionDialog = function (event, nodeRef) {
        $scope.documentNodeRef = nodeRef;

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/uploadNewVersion.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    $scope.uploadNewVersion = function (file) {
        siteService.uploadNewVersion(file, $scope.folderNodeRef, $scope.documentNodeRef).then(function (val) {
            hideDialogAndReloadContent();
        });
    };

    $scope.renameContentDialog = function (event, content) {
        $scope.documentNodeRef = content.nodeRef;
        $scope.newContentName = content.name;

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/renameContent.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    $scope.renameContent = function (newName) {
        var props = {
            prop_cm_name: newName
        };
        siteService.updateNode($scope.documentNodeRef, props).then(function (val) {
            hideDialogAndReloadContent();
        });
    };

    // We tried to have genericContentDialog inside the scope, but after having shown the dialog once the method was
    // missing from the scope.
    $scope.moveContentDialog = function (event, sourceNodeRef, parentNodeRef) {
        genericContentDialog("MOVE", event, sourceNodeRef, parentNodeRef);
    };

    $scope.copyContentDialog = function (event, sourceNodeRef, parentNodeRef) {
        genericContentDialog("COPY", event, sourceNodeRef, parentNodeRef);
    };

    function genericContentDialog (action, event, sourceNodeRef, parentNodeRef) {
        $scope.sourceNodeRefs = [];
        $scope.sourceNodeRefs.push(sourceNodeRef);
        $scope.parentNodeRef = parentNodeRef;
        $scope.contentAction = action;

        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/genericContentDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    $scope.dialogResponse = function(destinationNodeRef) {
        filebrowserService.genericContentAction($scope.contentAction.toLowerCase(), $scope.sourceNodeRefs, destinationNodeRef,
            $scope.parentNodeRef).then(function(response) {
            if (response.data.results[0].fileExist) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(true)
                        .title('Der er allerede en fil med samme navn i mappen du valgte.')
                        .ariaLabel('Eksisterer allerede')
                        .ok('Ok')
                );
            }
            hideDialogAndReloadContent();
        });
    };

    $scope.deleteContentDialog = function (event, content) {
        $scope.content = content;
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/deleteContent.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };

    $scope.deleteFile = function (nodeRef) {
        siteService.deleteFile(nodeRef).then(function (response) {
            hideDialogAndReloadContent();
        });
    };

    $scope.deleteLink = function (source, destination) {
        siteService.deleteLink(source, destination).then(function () {
            hideDialogAndReloadContent();
        });
    };

    // Templates

    $scope.createContentFromTemplateDialog = function (event, template, contentType) {
        $scope.template = template;
        $scope.newContentName = template.name;

        if(template.nodeRef == null) {
            $mdDialog.show({
                templateUrl: 'app/src/filebrowser/view/content/folder/newFolder.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true
            });
        }
        else {
            $scope.contentType = contentType;
            $mdDialog.show({
                templateUrl: 'app/src/filebrowser/view/content/createContentFromTemplateDialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true
            });
        }
    };

    $scope.createFolder = function (folderName) {
        var props = {
            prop_cm_name: folderName,
            prop_cm_title: folderName,
            alf_destination: $scope.folderNodeRef
        };
        siteService.createFolder("cm:folder", props).then(function (response) {
            hideDialogAndReloadContent();
        });
    };

    $scope.createContentFromTemplate = function (template_name, template_id) {
        filebrowserService.createContentFromTemplate(template_id, $scope.folderNodeRef, template_name).then(function (response) {
            if($scope.isSite) {
                siteService.createDocumentNotification(response.data[0].nodeRef, response.data[0].fileName);
            }
            hideDialogAndReloadContent();
        });
    };

    // Link

    $scope.newLinkDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/link/newProjectLink.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    };

    $scope.createProjectLink = function (project) {
        siteService.createProjectLink(project.shortName).then(function () {
            hideDialogAndReloadContent();
        });
    };

    $scope.searchProjects = function(query) {
        return filterService.search($scope.userManagedProjects, {
            title: query
        });
    };

    // SBSYS

    $scope.loadSbsysDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/sbsys/loadSbsys.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    };

    $scope.loadFromSbsys = function () {

        filebrowserService.loadFromSbsys().then(function () {
            hideDialogAndReloadContent();
        });
    };

    $scope.uploadSbsysDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/sbsys/uploadSbsys.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    };

    $scope.cancelSbsysDialog = function () {
        $scope.showProgress = false;
        $scope.uploadedToSbsys = false;
        $mdDialog.cancel();
    };

    $scope.uploadSbsys = function () {
        $scope.showProgress = true;
        $timeout(setSbsysShowAttr, 2500);
    };

    function setSbsysShowAttr() {
        $scope.showProgress = false;
        $scope.uploadedToSbsys = true;
    }
}