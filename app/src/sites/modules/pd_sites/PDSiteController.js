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
            

		} // SiteCtrl close
