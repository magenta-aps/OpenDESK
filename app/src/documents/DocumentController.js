'use strict';

angular.module('openDeskApp.documents')
    .controller('DocumentController', DocumentController);

function DocumentController($scope, $timeout, $translate, documentService, userService, $stateParams, $location, $state,
    documentPreviewService, alfrescoDownloadService, CLIENT_CONFIG, browserService,
    $mdDialog, notificationsService, authService, siteService, headerService, $window,
    EDITOR_CONFIG) {

    var vm = this;
    vm.doc = [];
    vm.plugin = [];
    vm.paths = [];
    vm.canEdit = false;
    vm.browser = {};
    vm.browser.isIE = CLIENT_CONFIG.browser.isIE;

    vm.showArchived = false;

    vm.documentTab = '/dokumenter';

    vm.notificationFrom = '';

    function setPDFViewerHeight() {
        var height = $(window).height() - 150 - $("header").outerHeight();

        $scope.iframeStyle = {
            "height": height + 'px',
            "width": "100%"
        };
    }
    setPDFViewerHeight();

    angular.element($window).bind('resize', function () {

        setPDFViewerHeight();
        // manuall $digest required as resize event
        // is outside of angular
        $scope.$digest();
    });

    if ($location.search().archived !== undefined && $location.search().archived === "true") {
        vm.showArchived = true;
    }

    var selectedDocumentNode = $stateParams.doc !== undefined ? $stateParams.doc : $stateParams.nodeRef.split('/')[3];
    var parentDocumentNode = $location.search().parent !== undefined ? $location.search().parent : selectedDocumentNode;
    var docHasParent = $location.search().parent !== undefined;
    var firstDocumentNode = "";

    documentService.getHistory(parentDocumentNode).then(function (val) {
        $scope.history = val;
        var currentNoOfHistory = $scope.history.length;
        var orgNoOfHistory = $location.search().noOfHist;
        if (currentNoOfHistory > 0) {
            firstDocumentNode = $scope.history[0].nodeRef;
        }
    });

    documentService.getEditPermission(parentDocumentNode).then(function (val) {
        vm.canEdit = val;
    });


    vm.selectFile = function (event) {
        var file = event.target.value;
        var fileName = file.replace(/^C:\\fakepath\\/, "");
        document.getElementById("uploadFile").innerHTML = fileName;
    };

    vm.cancel = function () {
        $mdDialog.cancel();
    };

    vm.goBack = function () {
        window.history.go(-2);
    }

    vm.godkendDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/documents/view/aproveComment.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    };

    vm.afvisDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/documents/view/rejectComment.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    };

    vm.uploadNewVersionDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/documents/view/uploadNewVersion.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    };


    // TODO: Check if this method is used. There is another method with same name and logic in SiteController
    vm.uploadNewVersion = function (file) {

        if (vm.paths[vm.paths.length - 1].title != file.name) {
            document.getElementById("uploadFile").innerHTML = "<i class='material-icons'>warning</i>&nbsp;Du skal vælge et dokument, der hedder<br>det samme som det eksisterende dokument. ";
        } else {
            documentService.getDocument(docHasParent ? parentDocumentNode : selectedDocumentNode).then(function (response) {

                siteService.getNode(response.item.location.site, "documentLibrary", response.item.location.path).then(function (val) {

                    var currentFolderNodeRef = val.parent.nodeRef;

                    siteService.uploadNewVersion(file, currentFolderNodeRef, response.item.nodeRef).then(function (response) {
                        var param = docHasParent ? parentDocumentNode : selectedDocumentNode;
                        if (window.location.hash == "#!/dokument/" + param) {
                            window.location.reload();
                        } else {
                            window.location.replace("/#!/dokument/" + param);
                        }
                    });

                    $mdDialog.cancel();

                });
            });
        }
    };

    // prepare to handle a preview of a document to review
    var paramValue = $location.search().dtype;
    if (paramValue !== undefined) {
        vm.wf_from = $location.search().from;
        vm.wf = paramValue === "wf";
        vm.wfr = paramValue === "wf-response";

        var NID = $location.search().NID;
        notificationsService.getInfo(NID).then(function (response) {
            vm.wf_comment = response.message;
            vm.wf_subject = response.subject;
        });
    }

    vm.getNotificationFrom = function () {
        userService.getPerson(vm.wf_from).then(function (val) {
            vm.notificationFrom = val;
        });
    };
    vm.getNotificationFrom();

    vm.createWFNotification = function (comment, wtype) {

        var creator = authService.getUserInfo().user.userName;
        var link = "#!/dokument/" + selectedDocumentNode + "?dtype=wf-response" + "&from=" + creator;

        var status = wtype == 'review-approved' ? 'godkendt' : 'afvist';

        var NID = $location.search().NID;
        notificationsService.getInfo(NID).then(function (response) {
            var project = response.project;

            notificationsService.addNotice(vm.wf_from, "Review " + status, comment, link, wtype, project).then(function (val) {
                $mdDialog.hide();
                vm.goBack();
            });


        });



    }


    vm.highlightVersion = function () {
        var elm = document.getElementById(selectedDocumentNode) != undefined ? selectedDocumentNode : firstDocumentNode;

        if (elm == "") {
            $timeout(vm.highlightVersion, 100);
        } else {
            document.getElementById(elm).style.backgroundColor = "#e1e1e1";
            document.getElementById(elm).style.lineHeight = "2";
        }
    }

    documentService.getDocument(parentDocumentNode).then(function (response) {

        vm.doc = response.item;
        vm.loolEditable = EDITOR_CONFIG.lool.mimeTypes.indexOf(vm.doc.node.mimetype) !== -1;
        vm.msOfficeEditable = EDITOR_CONFIG.msOffice.mimeTypes.indexOf(vm.doc.node.mimetype) !== -1;

        vm.docMetadata = response.metadata;

        // Compile paths for breadcrumb directive
        vm.paths = buildBreadCrumbPath(response);

        vm.site = vm.doc.location.site.name;

        siteService.loadSiteData(vm.site).then(function (response) {
            vm.type = response.type;
            vm.title = response.title;

            headerService.setTitle($translate.instant('SITES.' + vm.type + '.NAME') + ' : ' + vm.title);
        });

        browserService.setTitle(response.item.node.properties["cm:name"]);

        function buildBreadCrumbPath(response) {
            var paths = [{
                title: response.item.location.siteTitle,
                link: 'project.filebrowser({projekt: "' + response.item.location.site.name + '", path: ""})'
            }];
            var pathArr = response.item.location.path.split('/');
            var pathLink = '/';
            for (var a in pathArr) {
                if (pathArr[a] !== '') {
                    var link;
                    if (response.item.location.site === "") {
                        link = 'systemsettings.filebrowser({path: "' + pathLink + pathArr[a] + '"})';
                    } else {
                        link = 'project.filebrowser({projekt: "' + response.item.location.site.name +
                            '", path: "' + pathLink + pathArr[a] + '"})';
                    }
                    paths.push({
                        title: pathArr[a],
                        link: link
                    });
                    pathLink = pathLink + pathArr[a] + '/';
                }
            }
            paths.push({
                title: response.item.location.file,
                link: response.item.location.path
            });
            return paths;
        }

    });

    function loadPreview() {
        console.log('load preview');
        // todo check if not ok type like pdf, jpg and png - then skip this step
        if (docHasParent) {
            vm.store = 'versionStore://version2Store/';

            documentService.createVersionThumbnail(parentDocumentNode, selectedDocumentNode).then(function (response) {

                documentPreviewService.previewDocumentPlugin(response.data[0].nodeRef).then(function (plugin) {

                    vm.plugin = plugin;
                    $scope.config = plugin;
                    $scope.viewerTemplateUrl = documentPreviewService.templatesUrl + plugin.templateUrl;

                    $scope.download = function () {

                        // todo fix the download url to download from version/version2store
                        alfrescoDownloadService.downloadFile($scope.config.nodeRef, $scope.config.fileName);
                    };

                    if (plugin.initScope) {
                        plugin.initScope($scope);
                    }


                    // delete the temporary node
                    documentService.cleanupThumbnail(response.data[0].nodeRef)

                });
            })

        } else {
            vm.store = 'workspace://SpacesStore/';
            documentPreviewService.previewDocumentPlugin(vm.store + $stateParams.doc).then(function (plugin) {

                vm.plugin = plugin;
                $scope.config = plugin;
                $scope.viewerTemplateUrl = documentPreviewService.templatesUrl + plugin.templateUrl;
                $scope.download = function () {
                    alfrescoDownloadService.downloadFile($scope.config.nodeRef, $scope.config.fileName);
                };

                if (plugin.initScope) {
                    plugin.initScope($scope);
                }

            });
        }
    }

    loadPreview();

    function confirmLoolEditDocDialog(event) {
        var confirm = $mdDialog.confirm()
            .title('Vil du redigere dette dokument?')
            .htmlContent('<i class="material-icons">info_outline</i><p>Du er nu i gang med at redigere et dokument fra historikken.</p><p>Hvis du trykker OK nu, bliver dette dokument ophøjet til den gældende version.</p>')
            .ariaLabel('Fjern medlem')
            .targetEvent(event)
            .ok('OK')
            .cancel('Fortryd');
        $mdDialog.show(confirm).then(function () {
            var selectedVersion = $location.search().version;
            console.log("nuværende doc");
            console.log(vm.doc);
            console.log(vm.doc.version);
            console.log(vm.doc.node.version);
            documentService.revertToVersion("no coments", true, vm.doc.node.nodeRef, selectedVersion).then(function (response) {
                console.log("response");
                console.log(response);
                console.log(response.config.data.version);

                console.log("the new nodeRef:" + response.config.data.nodeRef)
                $state.go('lool', {
                    'nodeRef': vm.doc.node.nodeRef,
                    'versionLabel': vm.doc.version,
                    'parent': response.config.data.nodeRef
                });
            });
        });
    }

    vm.updatePreview = function () {
        loadPreview();
    }

    //Goes to the libreOffice online edit page
    vm.goToLOEditPage = function () {
        var ref = $stateParams.doc;
        var isFirstInHistory = ref == firstDocumentNode;
        if (docHasParent && !isFirstInHistory) {
            //first promote doc to latest version
            confirmLoolEditDocDialog();
        } else {
            $state.go('lool', {
                'nodeRef': vm.doc.node.nodeRef,
            });
        }
    };

    vm.editInMSOffice = function () {
        var pathStart = vm.docMetadata.serverURL;
        var pathEnd = vm.doc.webdavUrl.replace("webdav", "aos");
        var file = pathStart + "/alfresco" + pathEnd;
        console.log(file);
        try {
            var objword = new ActiveXObject("SharePoint.OpenDocuments");
            if (objword != null) {
                objword.EditDocument(file);
                // f.i. https://alfresco.ballerup.dk/alfresco/aos/Sites/swsdp/documentLibrary/Meeting%20Notes/Meeting%20Notes%202011-01-27.doc
            }
        } catch (e) {
            console.log(e);
        }
    };

    vm.downloadDocument = function downloadDocument() {
        var versionRef = vm.store + $stateParams.doc;
        alfrescoDownloadService.downloadFile(versionRef, vm.doc.location.file);
    };

    vm.reviewDocumentsDialog = function (event) {
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
        siteService.createReviewNotification(vm.doc.node.nodeRef, userName, comment);
        hideDialog();
    };

    vm.uploadNewVersionDialog = function (event) {
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
        siteService.uploadNewVersion(file, vm.doc.parent.nodeRef, vm.doc.node.nodeRef).then(function (val) {
            hideDialog();
            $state.go('document', {
                doc: parentDocumentNode
            });
        });
    };

    function hideDialog() {
        $mdDialog.hide();
    }

    $scope.cancelDialog = function () {
        $mdDialog.cancel();
    };

    $scope.searchUsers = function (filter) {
        return userService.getUsers(filter);
    };

    angular.element(document).ready(function () {
        if ($window.location.href.split('/')[4] != "lool") {
            vm.highlightVersion();
        }
    });
};