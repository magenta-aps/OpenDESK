'use strict';

angular.module('openDeskApp.documents')
    .controller('DocumentController', DocumentController);

function DocumentController($scope, $timeout, documentService, $stateParams, $location, documentPreviewService, alfrescoDownloadService, $mdDialog, notificationsService, authService, cmisService,siteService, $window) {
    
    var vm = this;
    vm.doc = [];
    vm.plugin = [];
    vm.paths = [];
	vm.title = [];

	var parentDocumentNode = "";
	var firstDocumentNode = "";
	var selectedDocumentNode = $stateParams.doc;

    if($location.search().archived !=  undefined && $location.search().parent !=  undefined)
    {
        vm.showArchived = $location.search().archived;
		parentDocumentNode = $location.search().parent;
    }
    else{
        vm.showArchived = false;
		parentDocumentNode = $stateParams.doc;
    }
    
    documentService.getHistory(parentDocumentNode).then (function (val){
        $scope.history = val;
		firstDocumentNode = $scope.history[0].nodeRef;
    });

    
	vm.selectFile = function(event){
        var file = event.target.value;
		var fileName = file.replace(/^C:\\fakepath\\/, "");
		document.getElementById("uploadFile").innerHTML = fileName;		
    };
	
	vm.cancel = function() {
		$mdDialog.cancel();
	};

    
    vm.newFolderDialog = function (event) {
        $mdDialog.show({
            templateUrl: 'app/src/documents/view/reviewComment.tmpl.html',
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
			scope: $scope,        // use parent scope in template
			preserveScope: true,  // do not forget this if use parent scope
			clickOutsideToClose: true
		});
	};


    vm.uploadNewVersion = function (file) {

		if(vm.paths[vm.paths.length -1].title != file.name){
			document.getElementById("uploadFile").innerHTML = "<i class='material-icons'>warning</i>&nbsp;Du skal vælge et dokument, der hedder<br>det samme som det eksisterende dokument. ";				
		} else {
			documentService.getDocument(vm.showArchived ? parentDocumentNode : selectedDocumentNode).then(function(response) {

				var cmisQuery = response.item.location.site + "/documentLibrary/" + response.item.location.path


				cmisService.getNode(cmisQuery).then(function (val) {

					var currentFolderNodeRef = val.data.properties["alfcmis:nodeRef"].value;
				   
					siteService.uploadNewVersion(file, currentFolderNodeRef, response.item.nodeRef).then(function(response){
						var param = vm.showArchived ? parentDocumentNode : selectedDocumentNode;
						if (window.location.hash == "#!/dokument/"+ param) {
							window.location.reload();
						} else {
							window.location.replace("/#!/dokument/"+ param);
						}
					} );

					$mdDialog.cancel();

				});
			});
		}
    };

    
    vm.getVersion = function (version) {

    }


    // prepare to handle a preview of a document to review
    var paramValue = $location.search().dtype;

    if (paramValue == "wf") {
        vm.wf_from = $location.search().from;
        vm.wf_doc = $location.search().doc;
        vm.wf = true;
    }

    
    vm.createWFNotification = function(comment) {
        var creator = authService.getUserInfo().user.userName;
        var link = "/#!/dokument/" + vm.wf_doc + "?dtype=wf-response" + "&from=" + creator + "&doc=" + vm.wf_doc;

        notificationsService.addNotice(vm.wf_from, "review svar", comment, link).then (function (val) {
            $mdDialog.hide();
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

    documentService.getDocument(parentDocumentNode).then(function(response) {
		
        vm.doc = response.item;
        

        // Compile paths for breadcrumb directive
        vm.paths = buildBreadCrumbPath(response);
		
		vm.title = response.item.location.siteTitle;
        
        function buildBreadCrumbPath(response) {
				var pathAtt = $location.search().type;
                var paths = [
                    {
                        title: 'Projekter',
                        link: '#!/projekter'
                    },
                    {
                        title: response.item.location.siteTitle,
                        link: '#!/projekter/' + response.item.location.site + '?type=' + pathAtt
                    }
                ];
                var pathArr = response.item.location.path.split('/');
                var pathLink = '/';
                for (var a in pathArr) {
                    if (pathArr[a] !== '') {
                        paths.push({
                            title: pathArr[a],
                            link: '#!/projekter/' + response.item.location.site + pathLink + pathArr[a] + '?type=' + pathAtt
							//link: '#!/projekter/' + response.item.location.site + pathLink + pathArr[a]
                        });
                        pathLink = pathLink + pathArr[a] + '/';
                    };
                };
                paths.push({
                    title: response.item.location.file,
                    link: response.item.location.path
                });
                return paths;
        };
        
    });


    // todo check if not ok type like pdf, jpg and png - then skip this step
    if (vm.showArchived) {


        vm.store = 'versionStore://version2Store/'

        documentService.createThumbnail(parentDocumentNode, selectedDocumentNode).then (function(response) {

            documentPreviewService.previewDocumentPlugin(response.data[0].nodeRef).then(function(plugin){

                vm.plugin = plugin;
                $scope.config = plugin;
                $scope.viewerTemplateUrl = documentPreviewService.templatesUrl + plugin.templateUrl;

                $scope.download = function(){

                    // todo fix the download url to download from version/version2store
                    alfrescoDownloadService.downloadFile($scope.config.nodeRef, $scope.config.fileName);
                };

                if(plugin.initScope){
                    plugin.initScope($scope);
                }


                    // delete the temporary node
                documentService.cleanupThumbnail(response.data[0].nodeRef)

            });
        })

    }
    else {
        vm.store = 'workspace://SpacesStore/'

        documentPreviewService.previewDocumentPlugin(vm.store + $stateParams.doc).then(function(plugin){

            vm.plugin = plugin;
            $scope.config = plugin;
            $scope.viewerTemplateUrl = documentPreviewService.templatesUrl + plugin.templateUrl;

            $scope.download = function(){
                alfrescoDownloadService.downloadFile($scope.config.nodeRef, $scope.config.fileName);
            };

            if(plugin.initScope){
                plugin.initScope($scope);
            }

        });
    }

	angular.element(document).ready(function () {
		vm.highlightVersion();
	});
    
};
	
