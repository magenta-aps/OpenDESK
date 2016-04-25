'use strict';

angular
    .module('openDeskApp.users')
    .controller('UsersController', UsersController);

function SitesController($scope, $mdDialog, siteService) {

    var vm = this;

    vm.newSite = function(event) {
        $mdDialog.show({
            templateUrl: 'app/src/sites/view/newProject.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose:true
        });
    }; // getSites close

    vm.createSite = function(name, description) {
        siteService.createSite(name, description);
        $mdDialog.hide();
    };

    vm.cancel = function() {
        $mdDialog.cancel();
    };

    siteService.getSites().then(function(val) {
        vm.sites = val;
    });


}; // SiteCtrl close
        