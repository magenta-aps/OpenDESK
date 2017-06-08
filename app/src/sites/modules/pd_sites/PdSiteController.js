'use strict';

angular
    .module('openDeskApp.pd_sites')
    .controller('PdSiteController', PdSiteController);
    
    function PdSiteController($q, $scope, $mdDialog, siteService, pd_siteService, groupService, $stateParams, authService,
                              alfrescoDownloadService) {

/*
        var membersLoaded = false;
        var pd = this;
        
        pd.site = {};
        pd.currentUser = authService.getUserInfo().user.userName;
		pd.stateStr = "";
		pd.hasDescription = false;

        pd.groups = [   'PD_PROJECTOWNER', 'PD_PROJECTMANAGER', 'PD_PROJECTGROUP',
                        'PD_WORKGROUP', 'PD_STEERING_GROUP', 'PD_MONITORS'];

        function loadSiteData() {
            if ($stateParams.projekt) {
                siteService.loadSiteData($stateParams.projekt).then(
                    function (response) {
                        pd.site = response;
						pd.stateStr = pd.site.state === "ACTIVE" ? "Igang" : "Afsluttet";
						pd.hasDescription = pd.site.description.trim() === "" ? false : true;
                    }
                );
            }
        }
        loadSiteData();
  */
    }
