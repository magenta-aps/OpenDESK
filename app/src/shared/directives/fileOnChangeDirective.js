angular
    .module('openDeskApp')
    .directive('fileOnChange', FileOnChangeDirective);

function FileOnChangeDirective() {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.fileOnChange);
            element.bind('change', onChangeHandler);
        }
    };
}
