'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteDetailController', SiteDetailController);

function SiteDetailController($scope, $mdDialog, $window, siteService, $stateParams, $translate, documentService, authService, $rootScope,
                        searchService, userService, browserService, headerService, alfrescoDownloadService) {

    $scope.history = [];
    $scope.roles = [];
    $scope.showGroupList = [];
    $scope.groups = {};
    $scope.groups.list = [];

    var vm = this;

    vm.cancelDialog = cancelDialog;
    vm.currentUser = authService.getUserInfo().user;
    vm.doPDF = doPDF;
    vm.editSiteDialog = editSiteDialog;
    vm.editSiteGroups = editSiteGroups;
    vm.getAutoSuggestions = getAutoSuggestions;
    vm.getSearchResults = getSearchResults;
    vm.gotoPath = gotoPath;
    vm.hasDescription = false;
    vm.newFileName = '';
    vm.newTemplateName = '';
    vm.openMemberInfo = openMemberInfo;
    vm.openMenu = openMenu;
    vm.path = $stateParams.path === undefined ? '' : $stateParams.path;
    vm.permissions = {};
    vm.project = {};
    vm.reload = reload;
    vm.searchTextList = [];
    vm.strings = {
        templateProject: "Template-Project",
        project: "Project"
    };

    vm.userService = userService;

    //sets the margin to the width of sidenav
	var tableHeight = $(window).height() - 300 - $("header").outerHeight() - $("#filebrowser-breadcrumb").outerHeight() - $("md-tabs-wrapper").outerHeight() - $("#table-actions").outerHeight();
    $("#table-container").css("max-height", tableHeight+"px");

    loadSiteData();

    function loadSiteData() {
        siteService.loadSiteData($stateParams.projekt).then(
            function (result) {

                vm.project = result;
                $scope.site = vm.project;
                browserService.setTitle(vm.project.title);
                $scope.currentUser = vm.currentUser;
                vm.project.visibilityStr = vm.project.visibility === "PUBLIC" ? "Offentlig" : "Privat";
                vm.hasDescription = vm.project.description.trim() !== "";

                siteService.setUserManagedProjects();
                loadMembers();
                getSiteUserPermissions();

                headerService.setTitle($translate.instant('SITES.' + vm.project.type + '.NAME') + ' : ' + vm.project.title);
            }
        );
    }

    function getSiteUserPermissions() {
        siteService.getSiteUserPermissions($stateParams.projekt).then(
            function (permissions) {
                vm.permissions = permissions;
            }
        );
    }
    
    function cancelDialog() {
        $mdDialog.cancel();
    }


    function reload() {
        $window.location.reload();
    }


    function openMenu($mdOpenMenu, event) {
        $mdOpenMenu(event);
    }
    
    function openMemberInfo(member, event) {
        var avatar = userService.getAvatarFromUser(member);
        $mdDialog.show({
            controller: ['$scope', 'member', function ($scope, member) {
                $scope.member = member;
                $scope.avatar = avatar;
            }],
            templateUrl: 'app/src/odSite/siteDetail/memberInfo.view.html',
            locals: {
                member: member
            },
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

    function loadMembers() {
        siteService.getGroupsAndMembers().then(function (groups) {
            $scope.groups.list = groups;

            angular.forEach($scope.groups.list, function(group) {
                $scope.roles.push(group[0].shortName);
                $scope.showGroupList.push(false);
                vm.searchTextList.push(null);
            });
        });
    }
    
    function getSearchResults(term) {
        return searchService.getSearchResults(term).then(function (val) {
            if (val !== undefined) {
                $rootScope.searchResults = [];
                $rootScope.searchResults = val.data.items;
                $window.location.href = "#!/search";
            } else {
                return [];
            }
        });
    }
    
    function getAutoSuggestions(term) {
        return searchService.getSearchSuggestions(term).then(function (val) {
            return val !== undefined ? val : [];
        });
    }

    function gotoPath(ref) {
        documentService.getPath(ref.split("/")[3]).then(function (val) {
            $scope.selectedDocumentPath = val.container;
            var path = ref.replace("workspace://SpacesStore/", "");

            $window.location.href = "/#!/dokument/" + path;
        });
    }

    function doPDF() {
        siteService.createMembersPDF(vm.project.shortName).then(function (response) {
            alfrescoDownloadService.downloadFile("workspace/SpacesStore/" + response[0].Noderef, "Medlemsliste.pdf");
        });
    }

    function editSiteDialog(ev) {
        $mdDialog.show({
            templateUrl: 'app/src/sites/view/editSite.tmpl.html',
            controller: 'SiteEditController',
            controllerAs: 'vm',
            locals: {
                sitedata: $scope.site
            },
            targetEvent: ev,
            // scope: $scope, // use parent scope in template
            // preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }

    function editSiteGroups(ev) {
        $mdDialog.show({
            templateUrl: 'app/src/sites/view/editMembers.tmpl.html',
            controller: 'SiteMemberController',
            controllerAs: 'vm',
            locals: {
                sitedata: $scope.site
            },
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }
}