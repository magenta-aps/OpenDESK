'use strict';

angular
	.module('openDeskApp.site')
	.controller('SiteListController', SiteListController);

function SiteListController($scope, $mdDialog, $window,  $interval, $translate, siteService,
						 sessionService, APP_BACKEND_CONFIG, browserService, headerService) {

	var vm = this;

	vm.cancelDialog = cancelDialog;
	vm.config = APP_BACKEND_CONFIG;
	vm.createSiteDialog = createSiteDialog;
	vm.currentDialogDescription = '';
	vm.currentDialogShortName = '';
	vm.currentDialogSite = '';
	vm.currentDialogTitle = '';
	vm.deleteSite = deleteSite;
	vm.deleteSiteDialog = deleteSiteDialog;
	vm.exactMatchFilter = exactMatchFilter;
	vm.infoSiteDialog = infoSiteDialog;
	vm.isAdmin = sessionService.isAdmin();
	vm.isLoading = true;
	vm.managerRole = 'Manager';
	vm.openMenu = openMenu;
	vm.organizationalCenters = [];
	vm.renameSiteDialog = renameSiteDialog;
	vm.searchMembers = [];
	vm.showall = false;
	vm.showFilters = false;
	vm.sites = [];
	vm.sitesPerUser = [];
	vm.states = [
		  		{key:'ACTIVE', name:'Igang'},
				{key:'CLOSED', name:'Afsluttet'},
				{key:'', name:'Alle'}];
	vm.types = [];
	vm.toggleFilters = toggleFilters;

	$scope.reverse = true;
    $scope.order = 'modified';

	activate();
	
	function activate() {
		vm.types.push({key: 'Project', name: $translate.instant('SITES.Project.NAME')});
		if(vm.config.enableProjects)
			vm.types.push({key: 'PD-Project', name: $translate.instant('SITES.PD-Project.NAME')});
		vm.types.push({key: '', name: $translate.instant('COMMON.ALL')});
	
		if(vm.config.enableSites && vm.config.enableProjects)
			vm.sitesName = 'SITES.NAME';
		else if(vm.config.enableSites)
			vm.sitesName = 'SITES.Project.NAME_PLURAL';
		else if(vm.config.enableProjects)
			vm.sitesName = 'SITES.PD-Project.NAME_PLURAL';
		
		browserService.setTitle($translate.instant('SITES.NAME'));
		headerService.setTitle($translate.instant(vm.sitesName));
	
		//sets the margin to the width of sidenav
		var tableHeight = $(window).height() - 200 - $("header").outerHeight() - $("#table-header").outerHeight() - $("#table-actions").outerHeight();
		$("#table-container").css("max-height", tableHeight+"px");

		getSites();
		getSitesPerUser();
		getAllOrganizationalCenters();
	}
	
	function exactMatchFilter(project) { 
		if(vm.search === undefined || vm.search.type === '') {
			return true;
		}

		return vm.search.type == project.type;
	}

	function getSites() {
		vm.isLoading = true;
		return siteService.getSites().then(function (response) {
			vm.sites = response;
			vm.isLoading = false;
		});
	}

	function getSitesPerUser() {
		return siteService.getSitesPerUser().then(function (response) {
			vm.sitesPerUser = response;
		});
	}


	function getAllOrganizationalCenters() {
		siteService.getAllOrganizationalCenters().then(function (response) {
			vm.organizationalCenters = response.data;
			vm.organizationalCenters.push({
				"shortName": "",
				"displayName": "Alle"
			});
		});
	}
	
	function deleteSiteDialog(project, event) {
		$mdDialog.show({
            controller: ['$scope', 'project', function ($scope, project) {
                $scope.project = project;
            }],
            templateUrl: 'app/src/sites/view/deleteProject.tmpl.html',
            locals: {
                project: project
            },
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true,
        });
	}

	function createSiteDialog(ev, type) {
        $mdDialog.show({
            templateUrl: 'app/src/odSite/siteCreate/siteCreate.view.html',
            controller: 'SiteCreateController',
            controllerAs: 'vm',
            locals: {
                sitetype: type
            },
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }
	
	function deleteSite(siteName) {
		siteService.deleteSite(siteName).then(function (result) {
			getSites();
			getSitesPerUser();
			$mdDialog.cancel();
		});
	}
	
	function cancelDialog() {
		$mdDialog.cancel();
	}

	function openMenu($mdOpenMenu, event) {
		$mdOpenMenu(event);
	}
	
	function toggleFilters() {
		vm.showFilters = !vm.showFilters;
		$interval(function(){}, 1,1000);
	}

	
	function renameSiteDialog(event, shortName, title, description) {
		vm.currentDialogTitle = title;
		vm.currentDialogDescription = description;
		vm.currentDialogShortName = shortName;
		$mdDialog.show({
			templateUrl: 'app/src/sites/view/updateSite.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
			scope: $scope, // use parent scope in template
			preserveScope: true, // do not forget this if use parent scope
			clickOutsideToClose: true
		});
	}

	function infoSiteDialog(site) {
		vm.currentDialogSite = site;
		$mdDialog.show({
			templateUrl: 'app/src/odSite/siteList/siteInfo.view.html',
			parent: angular.element(document.body),
			//targetEvent: event,
			scope: $scope, // use parent scope in template
			preserveScope: true, // do not forget this if use parent scope
			clickOutsideToClose: true
		});
	}
}