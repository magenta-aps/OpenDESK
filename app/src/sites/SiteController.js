'use strict';

angular
    .module('openDeskApp.sites')
    .controller('SiteController', SiteController);

function SiteController($scope, $mdDialog, $window, siteService, $stateParams, documentService, authService, $rootScope,
                        searchService, userService) {

    $scope.permissions = {};
    $scope.history = [];
    $scope.roles = [];
    $scope.roles_translated = [];
    $scope.showDetails = false;
    $scope.showGroupList = [];
    $scope.searchTextList = [];
    $scope.groups = {};
    $scope.groups.list = [];
    $scope.hasDescription = false;

    var vm = this;

    vm.project = {};
    vm.path = $stateParams.path == undefined ? '' : $stateParams.path;
    vm.newTemplateName = '';
    vm.newFileName = '';

    vm.strings = {};
    vm.strings.templateProject = "Template-Project";
    vm.strings.project = "Project";

    vm.currentUser = authService.getUserInfo().user;

    $scope.editSiteDialog = editSiteDialog;
    $scope.editSiteGroups = editSiteGroups;

    //sets the margin to the width of sidenav
	var tableHeight = $(window).height() - 300 - $("header").outerHeight() - $("#filebrowser-breadcrumb").outerHeight() - $("md-tabs-wrapper").outerHeight() - $("#table-actions").outerHeight();
    $("#table-container").css("max-height", tableHeight+"px");

    function loadSiteData() {
        siteService.loadSiteData($stateParams.projekt).then(
            function (result) {

                vm.project = result;
                $scope.site = vm.project;
                $scope.currentUser = vm.currentUser;
                vm.project.visibilityStr = vm.project.visibility === "PUBLIC" ? "Offentlig" : "Privat";
                $scope.hasDescription = vm.project.description.trim() !== "";

                siteService.setUserManagedProjects();
                loadMembers();
                getSiteUserPermissions();
            }
        );
    }
    loadSiteData();

    function getSiteUserPermissions() {
        siteService.getSiteUserPermissions($stateParams.projekt).then(
            function (permissions) {
                $scope.permissions = permissions;
            }
        );
    }

    vm.cancel = function () {
        $mdDialog.cancel();
    };

    vm.reload = function () {
        $window.location.reload();
    };

    vm.openMenu = function ($mdOpenMenu, event) {
        $mdOpenMenu(event);
    };

    vm.openMemberInfo = function (member, event) {
        var avatar = userService.getAvatarFromUser(member);
        $mdDialog.show({
            controller: ['$scope', 'member', function ($scope, member) {
                $scope.member = member;
                $scope.avatar = avatar;
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
    };

    function loadMembers() {
        siteService.getGroupsAndMembers().then(function (val) {
            $scope.groups.list = val;
            $scope.groups.list.forEach(function (group) {
                    $scope.roles.push(group[0].shortName);
                    $scope.showGroupList.push(false);
                    $scope.searchTextList.push(null);
            });

        });
    }

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
            return val !== undefined ? val : [];
        });
    };


    vm.gotoPath = function (ref) {
        documentService.getPath(ref.split("/")[3]).then(function (val) {
            $scope.selectedDocumentPath = val.container;
            var path = ref.replace("workspace://SpacesStore/", "");

            $window.location.href = "/#!/dokument/" + path;
        });
    };

    function editSiteDialog(ev) {
        $mdDialog.show({
            controller: 'SiteEditController',
            templateUrl: 'app/src/sites/view/editSite.tmpl.html',
            locals: {
                sitedata: $scope.site
            },
            parent: angular.element(document.body),
            targetEvent: ev,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            clickOutsideToClose: true
        });
    }

    function editSiteGroups(ev) {
        $scope.project = {};
        $scope.project.shortName = vm.project.shortName;

        $mdDialog.show({
            controller: 'SiteGroupController',
            templateUrl: 'app/src/sites/view/editGroups.tmpl.html',
            parent: angular.element(document.body),
            scope: $scope,
            preserveScope: true,
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }
}