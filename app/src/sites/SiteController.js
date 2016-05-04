'use strict';

    angular
        .module('openDeskApp.sites')
        .controller('SiteController', SiteController);
        
        function SiteController($scope, $mdDialog, $window, siteService, cmisService, $stateParams, $location) {
			
			var vm = this;

			vm.cancel = function() {
				$mdDialog.cancel();
			};

			vm.reload = function() {
				$window.location.reload();
			};


            var cmisQuery;
			if ($location.$$search.conservedPath != undefined) {
				// TODO refactor hardcoding of /projekter
				cmisQuery = $location.$$search.conservedPath.replace("/projekter", "") + "/" + $stateParams.projekt;
			}
			else
			   cmisQuery = $stateParams.projekt;



			cmisService.getContents(cmisQuery).then(function(val) {

				console.log(val);

				vm.contents = new Array();

				for (var x in val.data.objects) {
				  vm.contents.push({name : val.data.objects[x].object.succinctProperties["cmis:name"],
				                    contentType : val.data.objects[x].object.succinctProperties["cmis:objectTypeId"],
					  				conservedPath : cmisQuery});
				};

			});
			vm.project = $stateParams.projekt;

                        siteService.getSiteMembers(vm.project).then(function(val) {
                                vm.members = val;
                        });

                        vm.newMember = function(event) {
                                $mdDialog.show({
                                        templateUrl: 'app/src/sites/view/newMember.tmpl.html',
                                        parent: angular.element(document.body),
                                        targetEvent: event,
                                        clickOutsideToClose: true
                                });
                        };

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



