
    angular
        .module('openDeskApp.search')
        .controller('SearchController', SearchController);

    /**
     * Main Controller for the Search module
     * @param $scope
     * @constructor
     */
    function SearchController($scope, $stateParams, searchService) {
        var vm = this;

        $scope.searchResults = [];

        vm.getAutoSuggestions = function(term) {
            return searchService.getSearchSuggestions(term).then(function (val) {

                if (val != undefined) {
                    return val;
                }
                else {
                    return [];
                }
            });
        }

        vm.getSearchresults = function(term) {

            return searchService.getSearchResults(term).then(function (val) {

                if (val != undefined) {
                    $scope.searchResults = val;
                }
                else {
                    return [];
                }
            });
        }
    }

