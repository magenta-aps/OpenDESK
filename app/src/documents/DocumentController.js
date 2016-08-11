'use strict';

angular.module('openDeskApp.documents')
    .controller('DocumentController', DocumentController);

function DocumentController($scope, documentService, $stateParams, documentPreviewService, alfrescoDownloadService) {
    
    var vm = this;
    vm.doc = [];
    vm.plugin = [];
    vm.paths = [
        {
            title: 'Projekter',
            link: '#/projekter'
        }
    ];
 
    documentService.getDocument($stateParams.doc).then(function(response) {
        vm.doc = response.item;
        vm.paths.push({
            title: response.item.location.siteTitle,
            link: '#/projekter/' + response.item.location.site
        });
        var pathArr = response.item.location.path.split('/');
        for (var a in pathArr) {
            if (pathArr[a] !== '') {
                vm.paths.push({
                    title: pathArr[a],
                    link: '#/projekter/' + response.item.location.site + '/' + pathArr[a]
                });
            };
        }
        vm.paths.push({
            title: response.item.location.file,
            link: response.item.location.path
        });
    });
    
    documentPreviewService.previewDocumentPlugin('workspace://SpacesStore/' + $stateParams.doc).then(function(plugin){
        
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
    
};
