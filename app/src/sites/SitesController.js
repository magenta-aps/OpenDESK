'use strict';

    angular
        .module('openDeskApp.sites')
        .controller('SitesController', SitesController);
        
        function SitesController($scope, $mdDialog, $window, siteService, cmisService, $stateParams) {
			
			var vm = this;
			
			vm.newSite = function(event) {
				$mdDialog.show({
					templateUrl: 'app/src/sites/view/newProject.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
					clickOutsideToClose:true
				});
			};
			
			vm.createSite = function(name, description) {
				siteService.createSite(name, description);
				$mdDialog.hide();
			};

			vm.deleteSite = function(siteName) {
		    var confirm = $mdDialog.confirm()
					.title('Would you like to delete this projekt?')
					.textContent('This will remove all blablabla')
					.ok('Yes!')
					.cancel('No, changed my mind');
		    $mdDialog.show(confirm).then(function() {
					siteService.deleteSite(siteName);
		      // TODO add a redirect to projekter
		    });
			};

			vm.getSiteRoles = function(name) {
				siteService.getSiteRoles(name).then(function(val){
					vm.roles = val;
				});
			};

			vm.updateRoleOnSiteMember = function(siteName, userName, role) {
				siteService.updateRoleOnSiteMember(siteName, userName, role).then(function(val){
					// do stuff
				});
			};

			vm.addMemberToSite = function(siteName, userName, role) {
				siteService.addMemberToSite(siteName, userName, role).then(function(val){
					// do stuff
				});
			};

			vm.removeMemberFromSite = function(siteName, userName) {
				siteService.removeMemberFromSite(siteName, userName).then(function(val){
					// do stuff
				});
			};

			vm.cancel = function() {
				$mdDialog.cancel();
			};

			vm.reload = function() {
				$window.location.reload();
			};

			siteService.getSites().then(function(val) {
				vm.sites = val;
			});

			vm.projekt = $stateParams.projekt;

			// below for testing purpose - loads some data

			//siteService.getSiteRoles("heide").then(function(val) {
			//	vm.roles = val.siteRoles;
			//})

			//siteService.addMemberToSite("heide", "abeecher", "SiteContributor");
			//siteService.removeMemberFromSite("heide", "abeecher");
			//siteService.updateRoleOnSiteMember("heide", "abeecher", "SiteConsumer");

			//siteService.getSitesByQuery('1').then(function(val) {
			//		vm.roles = val;
			//})





        }; // SiteCtrl close



