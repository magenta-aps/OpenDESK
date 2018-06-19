'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteInfoController', SiteInfoController);

function SiteInfoController($scope, $mdDialog, siteService) {
    var vm = this;

    vm.editSiteDialog = editSiteDialog;
    vm.hasDescription = false;
    vm.permissions = [];
    vm.site = {};

    $scope.siteService = siteService;

    activate();

    function activate() {
        $scope.$watch('siteService.getSite()', function (site) {
            vm.site = site;
            vm.hasDescription = vm.site.description.trim() !== "";
            getSiteUserPermissions();
        });
    
    }

    function getSiteUserPermissions() {
        siteService.getSiteUserPermissions(vm.site.shortName)
        .then(function (permissions) {
            vm.permissions = permissions;
        });
    }

    function editSiteDialog(ev) {
        $mdDialog.show({
            templateUrl: 'app/src/odSite/siteEdit/siteEdit.view.html',
            controller: 'SiteEditController',
            controllerAs: 'vm',
            locals: {
                sitedata: vm.site
            },
            targetEvent: ev,
            clickOutsideToClose: true
        });
    }
}
