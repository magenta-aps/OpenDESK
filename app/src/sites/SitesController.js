'use strict';

    angular
        .module('openDeskApp.sites')
        .controller('SitesController', SitesController);
        
        function SitesController($scope, $mdDialog) {
					
					$scope.getSites = function(event) {
	   				$mdDialog.show({
	   				  templateUrl: 'app/src/sites/view/newProject.tmpl.html',
							parent: angular.element(document.body),
	   				  targetEvent: event,
	   				  clickOutsideToClose:true
		 				});
					}; // getSites close
					
					$scope.cancel = function() {
					  $mdDialog.cancel();
					};
					
					$scope.testSite = function(name, description) {
						console.log(name + ", " + description);
					}
					
        }; // SiteCtrl close
        