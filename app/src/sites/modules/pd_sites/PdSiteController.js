'use strict';

    angular
        .module('openDeskApp.pd_sites')
        .controller('PdSiteController', PdSiteController);
        
        function PdSiteController($mdDialog, pd_siteService) {

            var pd = this;
            
			// siteService.removeRole("kage2", "abeecher", "Consumer")

    		// pd_siteService.createPDSite("kage4", "desc", "100", "center_1","fhp", "fhp");

			// pd_siteService.getAllOrganizationalCenters();

			// siteService.addUser("kage1", "abeecher", "PD_MONITORS");
			// siteService.removeUser("kage1", "abeecher", "PD_MONITORS");
            
            pd.newPDSite = newPDSite;
            
            
            function newPDSite(ev) {
                $mdDialog.show({
                    controller: CreatePDSiteDialogController,
                    templateUrl: 'app/src/sites/modules/pd_sites/view/pd_create_site_dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                });
            }
            
            
            function CreatePDSiteDialogController($scope, $mdDialog, pd_siteService, $state) {
                
                $scope.newSite = {};
                
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                
                $scope.submitNewPDSite = function() {
                    // siteName, description, sbsys, center_id, owner, manager
                    pd_siteService.createPDSite(
                        $scope.newSite.siteName,
                        $scope.newSite.desc,
                        $scope.newSite.sbsys,
                        $scope.newSite.center_id,
                        $scope.newSite.owner,
                        $scope.newSite.manager
                    ).then(
                        function(response) {
                            console.log('Project created successfully. ' + response);
                            $state.go('project', { projekt: $scope.newSite.siteName });
                        },
                        function(err) {
                            console.log(err);
                        }
                    );
                };
                
            }
            

		}
