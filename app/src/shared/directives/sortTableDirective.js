
    angular
        .module('openDeskApp')
        .directive('sortTable', sortTable);

    function sortTable($compile){
		
        function sortLink(scope, element, attrs){
            element
                .append('<i class="material-icons" ng-if="reverseOrder && sortType == \''+attrs.sortTable+'\'">keyboard_arrow_down</i>')
                .append('<i class="material-icons" ng-if="!reverseOrder && sortType == \''+attrs.sortTable+'\'">keyboard_arrow_up</i>');				
				
            $compile(element.contents())(scope);

            if ('sortDefault' in attrs) {
                scope.orderByAttribute = attrs.sortTable;
                scope.reverseOrder = attrs.sortDefault=='reverse' ? true : false;
				if (scope.reverseOrder) {
					element.append('<i class="material-icons">keyboard_arrow_down</i>');
				} else {
					element.append('<i class="material-icons">keyboard_arrow_up</i>');
				}
            }

            element.bind('click', function(element){
                scope.orderByAttribute = attrs.sortTable;
                scope.reverseOrder = !scope.reverseOrder;
                if (scope.sortType !== scope.orderByAttribute) {
                    scope.sortType = scope.orderByAttribute;
                    scope.reverseOrder = true;
                }				
				if ('sortDefault' in attrs) {
					element.path[1].children[1].style.display = "none";
				}
                scope.$apply();
            });
        }

        return {
            link: sortLink,
            // restrict: 'A',
            scope: false
        }
    }