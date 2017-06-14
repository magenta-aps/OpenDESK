'use strict';

angular
	.module('openDeskApp.sites')
	.controller('SitesController', SitesController);

function SitesController($scope, $mdDialog, $window, $state, $interval, siteService, searchService, documentService,
						 pd_siteService, sessionService,fileUtilsService, userService) {


	var vm = this;

	vm.sites = [];
	vm.sitesPerUser = [];
	vm.organizationalCenters = [];
	vm.managerRole = 'Manager';
	vm.showall = false;
	vm.isAdmin = sessionService.isAdmin();
	vm.searchMembers = [];

	vm.showFilters = false;

	vm.infoSiteDialog = infoSiteDialog;
	vm.isLoading = true;

	vm.states = [
		  		{key:'ACTIVE', name:'Igang'},
				{key:'CLOSED', name:'Afsluttet'},
				{key:'', name:'Alle'}];
	
	vm.types = [
		  		{key:'Project', name:'Grupperum'},
				{key:'PD-Project', name:'Projekt'},
				{key:'', name:'Alle'}];

	vm.exactMatchFilter = function (project) { 
		if(vm.search == undefined || vm.search.type == '') {
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
	getSites();

	function getSitesPerUser() {
		return siteService.getSitesPerUser().then(function (response) {
			vm.sitesPerUser = response;
		});
	}
	getSitesPerUser();


	function getAllOrganizationalCenters() {
		pd_siteService.getAllOrganizationalCenters().then(function (response) {
			vm.organizationalCenters = response.data;
			vm.organizationalCenters.push({
				"shortName": "",
				"displayName": "Alle"
			});
		});
	}
	getAllOrganizationalCenters();


	vm.deleteSiteDialog = function (project, event) {
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
	};

	vm.deleteSite = function (siteName) {
		siteService.deleteSite(siteName).then(function (result) {

			getSites();

			getSitesPerUser();

			$mdDialog.hide();
		});
	};


	vm.cancel = function () {
		$mdDialog.cancel();
	};


	vm.reload = function () {
		$window.location.reload();
	};


	vm.openMenu = function ($mdOpenMenu, event) {
		$mdOpenMenu(event);
	};

	vm.toggleFilters = function () {
		vm.showFilters = !vm.showFilters;

		$interval(function(){}, 1,1000);
	}

	vm.currentDialogTitle = '';
	vm.currentDialogDescription = '';
	vm.currentDialogShortName = '';
	vm.renameSiteDialog = function (event, shortName, title, description) {
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
	};


	vm.currentDialogSite = '';


	function infoSiteDialog(site) {
		vm.currentDialogSite = site;
		$mdDialog.show({
			templateUrl: 'app/src/sites/view/infoSite.tmpl.html',
			parent: angular.element(document.body),
			//targetEvent: event,
			scope: $scope, // use parent scope in template
			preserveScope: true, // do not forget this if use parent scope
			clickOutsideToClose: true
		});
	}


	vm.getSearchresults = function getSearchReslts(term) {
		if(term != "")
			$state.go('search', {'searchTerm': term});
	};


	vm.getAutoSuggestions = function getAutoSuggestions(term) {
		return searchService.getSearchSuggestions(term).then(function (val) {

			if (val != undefined) {
				val.forEach(function(item) {
                	item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimetype, 24);
            	});
				return val;
			} else {
				return [];
			}
		});
	};


	vm.gotoPath = function (ref) {
		documentService.getPath(ref.split("/")[3]).then(function (val) {
			$scope.selectedDocumentPath = val.container
			var path = ref.replace("workspace://SpacesStore/", "");

			$window.location.href = "/#!/dokument/" + path;
		});
	};

	vm.searchPeople = function (query) {
		if (query) {
			return userService.getUsers(query);
		}
	}


} // SiteCtrl close