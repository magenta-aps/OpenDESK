angular
    .module('openDeskApp')
    .directive('breadcrumb', breadcrumb)

function breadcrumb() {

    return {
        restrict: 'E',
        scope: {
            bcPath: '=paths'
        },
        templateUrl: '/app/src/shared/directives/breadcrumb.html'
    }
}
