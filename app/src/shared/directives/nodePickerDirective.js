angular
    .module('openDeskApp')
    .directive('nodePicker', nodePicker);

function nodePicker() {

    return {
        restrict: 'E',
        scope: {
            currentNodeRef: '=root',
            model: '=model'
        },
        controller: function ($scope, alfrescoDocumentService) {

            alfrescoDocumentService.retrieveNodeInfo($scope.currentNodeRef).then(function (currentNode) {
                console.log("currentNode");
                console.log(currentNode);
                $scope.currentNode = currentNode;
            });

            $scope.getNode = function (nRef) {
                return alfrescoDocumentService.retrieveNodeInfo(nRef);
            };

            $scope.browseParent = function () {
                $scope.model = undefined;
                alfrescoDocumentService.retrieveNodeInfo($scope.currentNode[0].primaryParent_nodeRef).then(function (currentNode) {
                    $scope.currentNode = currentNode;
                });
            };

            $scope.browseChild = function (childNodeRef) {
                $scope.model = undefined;
                alfrescoDocumentService.retrieveNodeInfo(childNodeRef).then(function (currentNode) {
                    $scope.currentNode = currentNode;
                });
            };

            $scope.pickNode = function (nRef) {
                if ($scope.model === nRef) {
                    $scope.model = undefined;
                } else {
                    $scope.model = nRef;
                }

            };

        },
        templateUrl: '/app/src/shared/directives/nodePicker.html'
    }
}
