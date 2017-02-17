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
        controller: function (alfrescoDocumentService) {

            var ctrl = this;

            alfrescoDocumentService.retrieveNodeInfo(ctrl.currentNodeRef).then(function (currentNode) {
                ctrl.currentNode = currentNode;
            });

            ctrl.getNode = function (nRef) {
                return alfrescoDocumentService.retrieveNodeInfo(nRef);
            };

            ctrl.browseParent = function () {
                ctrl.model = undefined;
                alfrescoDocumentService.retrieveNodeInfo(ctrl.currentNode[0].primaryParent_nodeRef).then(function (currentNode) {
                    ctrl.currentNode = currentNode;
                });
            };

            ctrl.browseChild = function (childNodeRef) {
                ctrl.model = undefined;
                alfrescoDocumentService.retrieveNodeInfo(childNodeRef).then(function (currentNode) {
                    ctrl.currentNode = currentNode;
                });
            };

            ctrl.pickNode = function (nRef) {
                if (ctrl.model === nRef) {
                    ctrl.model = undefined;
                } else {
                    ctrl.model = nRef;
                }

            };

        },
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: '/app/src/shared/directives/nodePicker.html'
    }
}
