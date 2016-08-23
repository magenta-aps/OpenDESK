'use strict';

    angular
        .module('openDeskApp.sites')
        .controller('SitesController', SitesController);

        function SitesController($scope, $mdDialog, $window, siteService, cmisService, $stateParams) {

			var vm = this;
			
			siteService.getSites().then(function(val) {
				vm.sites = val;
			});

			vm.newSite = function(event) {
				$mdDialog.show({
					templateUrl: 'app/src/sites/view/newProject.tmpl.html',
					parent: angular.element(document.body),
					scope: $scope,
					preserveScope: true,
					targetEvent: event,
					clickOutsideToClose:true
				});
			};

			vm.createSite = function (name, description) {
				var r = siteService.createSite(name, description);

				r.then(function(result){			
					
					siteService.getSites().then(function(val) {
						vm.sites = val;
					});
					
					$mdDialog.hide();
				});
			}

			vm.deleteSiteDialog = function(siteName) {
				var confirm = $mdDialog.confirm()
					.title('Vil du slette dette projekt?')
					.textContent('Projektet og alle dets filer vil blive slettet')
					.ok('Ja')
					.cancel('Annullér');
				$mdDialog.show(confirm).then(function() {
					vm.deleteSite(siteName);
				});
			};
			
			vm.deleteSite = function (siteName) {
				var r = siteService.deleteSite(siteName);

				r.then(function(result){
					$mdDialog.hide();
					
					siteService.getSites().then(function(val) {
						vm.sites = val;
					});
				});
			}


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



			vm.querySites = function(q) {
				return siteService.getSitesByQuery(q).then(function (val) {
					vm.sites = val;
				});
			}


			vm.currentDialogSite = '';
			vm.renameSiteDialog = function (event, site) {
				vm.currentDialogSite = site;		
				$mdDialog.show({
					templateUrl: 'app/src/sites/view/renameSite.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: event,
					scope: $scope,        // use parent scope in template
					preserveScope: true,  // do not forget this if use parent scope
					clickOutsideToClose: true
				});
			};

			vm.updateSiteName = function (shortName, newName) {
				var r = siteService.updateSiteName(shortName, newName);

				r.then(function(result){
					vm.project_title = result.title;
					$mdDialog.hide();
					
					siteService.getSites().then(function(val) {
						vm.sites = val;
					});
				});
			}

        }; // SiteCtrl close



