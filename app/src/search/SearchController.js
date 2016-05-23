
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

        //
        //vm.getAutoSuggestions = function(term) {
        //
        //    searchService.getSearchSuggestions(term).then(function (response) {
        //        vm.results = response;
        //    });
        //}


        vm.getAutoSuggestions = function(term) {


            searchService.getSearchSuggestions(term).then(function (val) {
                console.log("Thada");
                console.log(val);
                if (val != undefined) {
                    return val;
                }
                else {
                    return [];
                }

            });
        }

    }