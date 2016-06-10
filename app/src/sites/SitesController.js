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
					.title('Vil du slette dette projekt?')
					.textContent('Projektet og alle dets filer vil blive slettet')
					.ok('Ja')
					.cancel('Annullér');
		    $mdDialog.show(confirm).then(function() {
					siteService.deleteSite(siteName);
		      // TODO add a redirect to projekter
		    });
			};


			vm.cancel = function() {
				$mdDialog.cancel();
			};

			vm.reload = function() {
				$window.location.reload();
			};
			
			var originatorEv;
			vm.openMenu = function($mdOpenMenu, event) {
			  originatorEv = event;
			  $mdOpenMenu(event);
			};

			siteService.getSites().then(function(val) {
				vm.sites = val;
			});



			vm.querySites = function(q) {
				return siteService.getSitesByQuery(q).then(function (val) {
					vm.sites = val;
				});
			}


            //
			//vm.projekt = $stateParams.projekt;
            //


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



