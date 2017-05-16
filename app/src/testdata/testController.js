'use strict';

angular
    .module('openDeskApp.testdata')
    .controller('TestController', TestController);

function TestController($scope, $mdDialog, $window, testService, siteService, $stateParams, searchService, $rootScope, documentService, $timeout) {

    var vm = this;

            //Først skal clean up and purge webscriptet kaldes : http://0.0.0.0:8080/alfresco/s/cleanupandpurge

            var sites = siteService.getSites().then (function (result) {
                testService.addDocumentsToSites().then(function (result) {
                    testService.addMembersToSite();
                });
            });

    // TODO setup wait for the loadSites to be finished before the documents are added

// fix - lav en controller for hver funktion du ønsker - f.eks. en der kalder indlæs sites.



}; // SiteCtrl close



