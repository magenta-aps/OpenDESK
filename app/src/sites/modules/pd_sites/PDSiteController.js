'use strict';

    angular
        .module('openDeskApp.pd_sites')
        .controller('PDSiteController', PDSiteController);
        
        function PDSiteController() {

            var pd = this;
            
			// siteService.removeRole("kage2", "abeecher", "Consumer")

			 //pd_siteService.createPDSite("kage4", "desc", "100", "center_1","fhp", "fhp");

			//pd_siteService.getAllOrganizationalCenters();

			//siteService.addUser("kage1", "abeecher", "PD_MONITORS");
			//siteService.removeUser("kage1", "abeecher", "PD_MONITORS");
            
            pd.newPDSite = newPDSite;
            
            
            function newPDSite(ev) {
                console.log('creating new pdsite' + ev);
            };
			
			pd.loadProjectMembers  = function(projectShortname, memberType) {
				pd.projectMembers = [];
				siteService.getGroupMembers(projectShortname, memberType).then (function (val){
					pd.projectGroup = val;
				});
			};
			
			var membersLoaded = false;
			function showProjectMembers(elm, projectShortname, memberType) {
				if (elm.checked == true && !membersLoaded) {
					pd.loadProjectMembers(projectShortname, memberType);
					membersLoaded = true;
				}
			}
			
			
			
			/*
			vm.loadHistory  = function(doc) {
				$scope.history = [];
				documentService.getHistory(doc).then (function (val){
					$scope.history = val;
				});
			};
			*/
			
/*			
PD_PROJECTGROUP (Projektgruppe)

PD_WORKGROUP (Arbejdsgruppe)

PD_MONITORS (Følgegruppe)

PD_STEERING_GROUP (styregruppe)
*/            

		} // SiteCtrl close
