'use strict';

angular.module('openDeskApp.documents', ['ngRoute', 'checklist-model'])

    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider.when('/projects/edit-online/:docId?/:extra?', {
            templateUrl: 'documents/view/edit-online.html',
            controller: 'EditOnlineCtrl'
        });
    }])


    .controller('EditOnlineCtrl', function ($scope, $routeParams, $rootScope, reviewService) {
        $scope.docId = $routeParams.docId;

        var reviewItems = reviewService.getItemsForReview($rootScope.userName);
        // Is the docId being reviewed by the current user?
        if (reviewItems.some(function (item) {
                return item.docId == $scope.docId;
            })) {
            $scope.isReviewing = true;
        } else {
            $scope.isReviewing = false;
        }


        $scope.approved = false;
        $scope.pending = false;

        $scope.startReview = function () {
            // TODO: make selectable?
            var userAssigned = "joergen";

            alert("Dokumentet er sendt til godkendelse hos " + userAssigned);
            $scope.pending = true;
            reviewService.startReview($scope.docId, $rootScope.userName, userAssigned);
        };

        $scope.approve = function () {
            reviewService.clearReviews();
            alert("Dokumentet er godkendt");
            $scope.isReviewing = false;
            $scope.pending = false;
            $scope.approved = true;
        };
    })


    .controller('DocumentCtrl', function ($rootScope, $scope, $log, $location, cmisService, restService) {
        $scope.parents = [];
        $scope.siteMebers =[];

        $scope.selectedItems = [];

        $scope.newDocument = function () {
            $location.path('/documents/view/edit-online');
        };


        $scope.breadcrumb = function (index) {
            var selected = $scope.parents[index];
            $scope.parents = $scope.parents.slice(0, index);
            $scope.openFolder(selected.path, selected.name);
        };

        $scope.openFolder = function (path, name) {
            cmisService.getChildren(path).then(function (response) {
                $scope.nodes = response.data.objects;
                var matches = path.match("/Sites/(.+?)/");

                if (matches != null) {
                    $scope.site = matches[1];
                    restService.getSiteMembers($scope.site).then(function(response){
                        $scope.siteMembers = response;
                    });

                } else {
                    $scope.site = null;
                }

                $log.log($scope.nodes);
                $scope.parents.push({
                    path: path,
                    name: name
                });
                $scope.selectedItems = [];
            });
        };

        $scope.nodes = $scope.openFolder('Sites', 'Projects');


        $scope.createFolder = function CaseDocsFolderDialog(parentRef, folder){
            var dlg = this;
            dlg.folderName = '';
            dlg.isNew = folder == null;
            dlg.save = save;

            if(folder != null){
                dlg.folderName = folder.title;
            }

            dlg.cancel = function(){
                $mdDialog.cancel();
            };

            function save(){
                var props = {
                    prop_cm_name: dlg.folderName,
                    prop_cm_title: dlg.folderName
                };
                if(dlg.isNew){
                    props.alf_destination = parentRef;
                    formProcessorService.createNode("cm:folder", props).then(function(nodeRef){
                        $mdDialog.hide(nodeRef);
                    });
                }else{
                    formProcessorService.updateNode(folder.nodeRef, props).then(function(){
                        $mdDialog.hide();
                    });
                }
            }
        }


    }).directive('cmisObject', function () {
        return {
            restrict: 'EA',
            scope: {
                properties: '=',
                selectedItems: '=',
                clickHandler: '&clickHandler'
            },
            link: function (scope, element, attrs) {
                scope.click = function (isProject) {
                    var path = scope.properties['cmis:path'];
                    var name = scope.properties['cmis:name'];
                    if(typeof isProject !== 'undefined' && isProject) {
                        path += "/";
                        name = scope.properties['cm:title'];
                    }

                    scope.clickHandler({
                        path: path,
                        name: name
                    });
                };
            },
            templateUrl: 'app/src/documents/partials/cmisObject.html'
        };
    }).filter('downloadUrl', function (cmisService) {
        return function (objectId, asAttachment) {
            var baseUrl = cmisService.getCMISBaseUrl();
            var downloadUrl = baseUrl + 'root?objectId=' + objectId + '&cmisselector=content';
            if (asAttachment) {
                downloadUrl += '&download=attachment';
            }
            return downloadUrl;
        }
    });