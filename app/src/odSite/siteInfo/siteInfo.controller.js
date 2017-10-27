'use strict';

angular
    .module('openDeskApp.site')
    .controller('SiteInfoController', SiteInfoController);

function SiteInfoController($scope, siteService) {
    var vm = this;
    
    vm.site = {};

    $scope.siteService = siteService;

    activate();

    $scope.$watch('siteService.getSite()', function (site) {
        vm.site = site;
    });

    function activate() {
        vm.site = siteService.getSite();
    }
}