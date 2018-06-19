'use strict';

angular
	.module('openDeskApp.site')
	.controller('SiteListController', SiteListController);

function SiteListController($scope, $mdDialog,  $interval, $translate, siteService, member,
						 sessionService, APP_BACKEND_CONFIG, browserService, headerService, alfrescoNodeUtils) {

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
    vm.searchPeople = searchPeople;
	vm.showall = false;
	vm.showFilters = false;
	vm.sites = [];
	vm.sitesPerUser = [];
	vm.states = [
		  		{key:'ACTIVE', name:'Igang'},
				{key:'CLOSED', name:'Afsluttet'},
				{key:'', name:'Alle'}];
	vm.types = [];
    vm.toggleFavourite = toggleFavourite;
	vm.toggleFilters = toggleFilters;
	vm.getFavouriteIcon = getFavouriteIcon;

	$scope.reverse = false;
    $scope.order = 'title';

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
            templateUrl: 'app/src/odSite/siteList/deleteProject.tmpl.html',
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
		siteService.delete(siteName)
		.then(function () {
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
			templateUrl: 'app/src/odSite/siteList/updateSite.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: event,
			scope: $scope, // use parent scope in template
			preserveScope: true, // do not forget this if use parent scope
			clickOutsideToClose: true
		});
	}

    function searchPeople(query) {
        if (query) {
            return member.search(query);
        }
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

    function toggleFavourite(node) {
        var nodeId = alfrescoNodeUtils.processNodeRef(node.nodeRef).id;
	    if(node.isFavourite)
	        siteService.removeFavourite(nodeId).then(function () {
                node.isFavourite = false;
            });
	    else
            siteService.addFavourite(nodeId).then(function () {
                node.isFavourite = true;
            });
    }

    function getFavouriteIcon(isFavourite) {
        return isFavourite ? 'star' : 'star_border';
    }
}