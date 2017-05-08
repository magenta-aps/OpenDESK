angular
    .module('openDeskApp.discussion')
    .controller('DiscussionController', DiscussionController)
    .directive('odDiscussion', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'app/src/odDiscussion/view/overview.html'
        };
    });

function DiscussionController($scope, $log) {
    var vm = this;

    console.log('discussion controller');

    function reply() {
        $mdDialog.show({
            templateUrl: 'app/src/odDiscussion/view/reply.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }

};
