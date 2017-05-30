'use strict';

angular
	.module('openDeskApp.sites')
	.controller('SitesController', SitesController);

function SitesController($scope, $mdDialog, $window, $state, $interval, siteService, cmisService, $stateParams, searchService, $rootScope, $translate, documentService, authService, pd_siteService, sessionService,fileUtilsService) {


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
		return siteService.getSites().then(function (response) {
			vm.sites = response;
			return response;
		});
	}
	getSites();

	function getSitesPerUser() {
		return siteService.getSitesPerUser().then(function (response) {
			vm.sitesPerUser = response;
			return response;
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


	vm.newSite = function (event) {
		$mdDialog.show({
			templateUrl: 'app/src/sites/view/newProject.tmpl.html',
			parent: angular.element(document.body),
			scope: $scope,
			preserveScope: true,
			targetEvent: event,
			clickOutsideToClose: true
		});
	};


	vm.createSite = function (name, description, isPrivateVisibility) {

		var visibility = "PUBLIC"; // Visibility is set to public
		if (isPrivateVisibility) {
			visibility = "PRIVATE";
		}

		return siteService.createSite(name, description, visibility).then(function (val) {

			$mdDialog.hide();

			getSites().then(function (val) {
				vm.sites = val;
			});

			getSitesPerUser().then(function (val) {
				vm.sitesPerUser = val;
			});

			$state.go( 'project', { projekt: val[0].shortName , path: ""}  );

		});
	};

	vm.deleteSiteDialog = function (project, event) {
		console.log('deletesite dialog');
		console.log(project);

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
		var r = siteService.deleteSite(siteName);

		r.then(function (result) {
			$mdDialog.hide();

			getSites().then(function (val) {
				vm.sites = val;
			});

			getSitesPerUser().then(function (val) {
				vm.sitesPerUser = val;
			});
			
			//vm.reload();
		});
	};


	vm.cancel = function () {
		$mdDialog.cancel();
	};

	vm.reload = function () {
		$window.location.reload();
	};

	var originatorEv;
	vm.openMenu = function ($mdOpenMenu, event) {
		originatorEv = event;
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
			templateUrl: 'app/src/sites/view/renameSite.tmpl.html',
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
		$state.go('search', {'searchTerm': term});
		/*
		return searchService.getSearchResults(term).then(function (val) {

			console.log(val);

			if (val != undefined) {

				$rootScope.searchResults = [];
				$rootScope.searchResults = val.data.items;

				window.location.href = "#!/search";

			} else {
				return [];
			}
		});
		*/
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


	vm.gotoPath = function (nodeRef) {

		var ref = nodeRef;

		documentService.getPath(ref.split("/")[3]).then(function (val) {

			$scope.selectedDocumentPath = val.container
			// var project = val.site;
			// var container = val.container;
			// var path = val.path;

			var path = ref.replace("workspace://SpacesStore/", "");
			$window.location.href = "/#!/dokument/" + path;
		});
	};

	vm.searchPeople = function (query) {
		console.log('search people');
		if (query) {
			return siteService.getAllUsers(query);
		}
	}

	vm.getFullName = function(user) {
		try {
			return user.firstName + " " + user.lastName;
		}
		catch(err) {	}
	}


} // SiteCtrl close