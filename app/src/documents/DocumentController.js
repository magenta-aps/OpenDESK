'use strict';

angular.module('openDeskApp.documents').controller('DocumentController', function (documentService, $scope) {
    documentService.getDocuments().then(function (documents) {
        //$scope.sites = sites;
    });
    return {
        createSite : function() {

            documentService.getDocuments();


        }
    }
});