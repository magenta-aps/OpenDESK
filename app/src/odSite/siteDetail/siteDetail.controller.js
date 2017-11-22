'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteDetailController', SiteDetailController);

function SiteDetailController($scope, $mdDialog, $window, siteService, $stateParams, $translate, documentService,
                              authService, $rootScope, searchService, userService, browserService, headerService,
                              alfrescoDownloadService, groupService, sessionService) {

    $scope.history = [];
    $scope.showGroupList = [];
    
    var vm = this;
    
    vm.cancelDialog = cancelDialog;
    vm.currentUser = authService.getUserInfo().user;
    // vm.getAutoSuggestions = getAutoSuggestions;
    // vm.getSearchResults = getSearchResults;
    // vm.gotoPath = gotoPath;
    vm.groups = {};
    vm.permissions = {};
    vm.site = {};
    vm.searchTextList = [];
    vm.templateProjectLabel = "Template-Project";

    //sets the margin to the width of sidenav
	var tableHeight = $(window).height() - 300 - $("header").outerHeight() - $("#filebrowser-breadcrumb").outerHeight() - $("md-tabs-wrapper").outerHeight() - $("#table-actions").outerHeight();
    $("#table-container").css("max-height", tableHeight+"px");

    activate();

    function activate() {
        siteService.loadSiteData($stateParams.projekt).then(function (result) {
            vm.site = result;
            
            browserService.setTitle(vm.site.title);
            headerService.setTitle($translate.instant('SITES.' + vm.site.type + '.NAME') + ' : ' + vm.site.title);

            siteService.setUserManagedProjects();
            getSiteUserPermissions();

            }
        );
    }

    function getSiteUserPermissions() {
        siteService.getSiteUserPermissions($stateParams.projekt).then(function (permissions) {
            vm.permissions = permissions;
        });
    }
    
    function cancelDialog() {
        $mdDialog.cancel();
    }
    
    // function getSearchResults(term) {
    //     return searchService.getSearchResults(term).then(function (val) {
    //         if (val !== undefined) {
    //             $rootScope.searchResults = [];
    //             $rootScope.searchResults = val.data.items;
    //             $window.location.href = "search";
    //         } else {
    //             return [];
    //         }
    //     });
    // }
    
    // function getAutoSuggestions(term) {
    //     return searchService.getSearchSuggestions(term).then(function (val) {
    //         return val !== undefined ? val : [];
    //     });
    // }

    // function gotoPath(ref) {
    //     documentService.getPath(ref.split("/")[3]).then(function (val) {
    //         $scope.selectedDocumentPath = val.container;
    //         var path = ref.replace("workspace://SpacesStore/", "");

    //         $window.location.href = "/dokument/" + path;
    //     });
    // }
}