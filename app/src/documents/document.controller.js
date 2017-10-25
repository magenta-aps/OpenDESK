'use strict';

angular.module('openDeskApp.documents')
    .controller('DocumentController', DocumentController);

function DocumentController($scope, $timeout, $translate, documentService, userService, $stateParams, $location, $state,
    documentPreviewService, alfrescoDownloadService, browserService, $mdDialog, notificationsService, authService,
                            siteService, headerService, $window, editOnlineMSOfficeService) {

    var vm = this;

    vm.doc = [];
    vm.plugin = [];
    vm.paths = [];
    vm.canEdit = false;
    vm.browser = {};

    vm.showArchived = false;

    vm.updatePreview = loadPreview;
    vm.selectFile = selectFile;
    vm.approveCommentDialog = approveCommentDialog;
    vm.rejectCommentDialog = rejectCommentDialog;
    vm.uploadNewVersionDialog = uploadNewVersionDialog;
    vm.uploadNewVersion = uploadNewVersion;
    vm.searchUsers = searchUsers;
    vm.cancelDialog = cancelDialog;
    vm.goBack = goBack;
    vm.createWFNotification = createWFNotification;
    vm.highlightVersion = highlightVersion;
    vm.goToLOEditPage = goToLOEditPage;
    vm.editInMSOffice = editInMSOffice;
    vm.downloadDocument = downloadDocument;
    vm.reviewDocumentsDialog = reviewDocumentsDialog;
    vm.createReviewNotification = createReviewNotification;

    var selectedDocumentNode = $stateParams.doc !== undefined ? $stateParams.doc : $stateParams.nodeRef.split('/')[3];
    var parentDocumentNode = $location.search().parent !== undefined ? $location.search().parent : selectedDocumentNode;
    var docHasParent = $location.search().parent !== undefined;
    var firstDocumentNode = "";

    angular.element($window).bind('resize', function () {

        setPDFViewerHeight();
        // manuall $digest required as resize event
        // is outside of angular
        $scope.$digest();
    });

    activate();

    function activate() {
        if ($location.search().archived !== undefined && $location.search().archived === "true") {
            vm.showArchived = true;
        }
        
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

        setPDFViewerHeight();
        loadPreview();
        getDocument();
        prepDocumentToReview();
    }

    function searchUsers(filter) {
        return userService.getUsers(filter);
    }

    function cancelDialog() {
        $mdDialog.cancel();
    }


    function goBack() {
        window.history.go(-2);
    }

    function setPDFViewerHeight() {
        var height = $(window).height() - 150 - $("header").outerHeight();

        $scope.iframeStyle = {
            "height": height + 'px',
            "width": "100%"
        };
    }

    function selectFile(event) {
        var file = event.target.value;
        var fileName = file.replace(/^C:\\fakepath\\/, "");
        document.getElementById("uploadFile").innerHTML = fileName;
    }

    function approveCommentDialog(event) {
        $mdDialog.show({
            templateUrl: 'app/src/documents/view/aproveComment.tmpl.html',
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    function rejectCommentDialog(event) {
        $mdDialog.show({
            templateUrl: 'app/src/documents/view/rejectComment.tmpl.html',
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    function uploadNewVersionDialog(event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/uploadNewVersion.tmpl.html',
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }

    function uploadNewVersion(file) {
        siteService.uploadNewVersion(file, vm.doc.parent.nodeRef, vm.doc.node.nodeRef).then(function (val) {
            $mdDialog.cancel();
            $state.go('document', {
                doc: parentDocumentNode
            });
        });
    }

    // prepare to handle a preview of a document to review

    function prepDocumentToReview() {
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
    }

    function createWFNotification(comment, wtype) {

        var creator = authService.getUserInfo().user.userName;
        var link = "#!/dokument/" + selectedDocumentNode + "?dtype=wf-response" + "&from=" + creator;

        var status = wtype == 'review-approved' ? 'godkendt' : 'afvist';

        var NID = $location.search().NID;
        notificationsService.getInfo(NID).then(function (response) {
            var project = response.project;

            notificationsService.addNotice(vm.wf_from, "Review " + status, comment, link, wtype, project).then(function (val) {
                $mdDialog.cancel();
                vm.goBack();
            });
        });
    }

    function highlightVersion() {
        var elm = document.getElementById(selectedDocumentNode) !== undefined ? selectedDocumentNode : firstDocumentNode;

        if (elm === "") {
            $timeout(vm.highlightVersion, 100);
        } else {
            elm.style.backgroundColor = "#e1e1e1";
            elm.style.lineHeight = "2";
        }
    }

    function getDocument() {
        documentService.getDocument(parentDocumentNode).then(function (response) {

        vm.doc = response.item;
        vm.loolEditable = documentService.isLoolEditable(vm.doc.node.mimetype);
        vm.msOfficeEditable = documentService.isMsOfficeEditable(vm.doc.node.mimetype);

            vm.docMetadata = response.metadata;

            // Compile paths for breadcrumb directive
            vm.paths = buildBreadCrumbPath(response);

            vm.site = vm.doc.location.site.name;

            siteService.loadSiteData(vm.site).then(function (response) {
                vm.type = response.type;
                vm.title = response.title;
                vm.siteNodeRef = response.nodeRef;

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
    }

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
                    documentService.cleanupThumbnail(response.data[0].nodeRef);

                });
            });

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

    function confirmLoolEditDocDialog(event) {
        var confirm = $mdDialog.confirm()
            .title('Vil du redigere dette dokument?')
            .htmlContent('<i class="material-icons">info_outline</i><p>Du er nu i gang med at redigere et dokument fra historikken.</p><p>Hvis du trykker OK nu, bliver dette dokument ophøjet til den gældende version.</p>')
            .targetEvent(event)
            .ok('OK')
            .cancel('Fortryd');

        $mdDialog.show(confirm).then(function () {
            var selectedVersion = $location.search().version;
            documentService.revertToVersion("no coments", true, vm.doc.node.nodeRef, selectedVersion).then(function (response) {
                $state.go('lool', {
                    'nodeRef': vm.doc.node.nodeRef,
                    'versionLabel': vm.doc.version,
                    'parent': response.config.data.nodeRef
                });
            });
        });
    }

    //Goes to the libreOffice online edit page
    function goToLOEditPage() {
        var ref = $stateParams.doc;
        var isFirstInHistory = ref === firstDocumentNode;
        if (docHasParent && !isFirstInHistory) {
            //first promote doc to latest version
            confirmLoolEditDocDialog();
        } else {
            $state.go('lool', {
                'nodeRef': vm.doc.node.nodeRef
            });
        }
    }

    function editInMSOffice() {
        editOnlineMSOfficeService.editOnline(vm.siteNodeRef, vm.doc, vm.docMetadata);
    }
    
    function downloadDocument() {
        var versionRef = vm.store + $stateParams.doc;
        alfrescoDownloadService.downloadFile(versionRef, vm.doc.location.file);
    }


    function reviewDocumentsDialog(event) {
        $mdDialog.show({
            templateUrl: 'app/src/filebrowser/view/content/document/reviewDocument.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }
    
    function createReviewNotification(userName, comment) {
        siteService.createReviewNotification(vm.doc.node.nodeRef, userName, comment);
        $mdDialog.cancel();
    }

    //this should be removed, do not edit dom in controller!
    angular.element(document).ready(function () {
        if ($window.location.href.split('/')[4] != "lool") {
            vm.highlightVersion();
        }
    });
}