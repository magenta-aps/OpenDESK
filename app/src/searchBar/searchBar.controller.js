angular
    .module('openDeskApp')
    .controller('SearchBarController', SearchBarController);

function SearchBarController($scope, $state, $interval, $translate, $stateParams, searchService, fileUtilsService) {

    var vm = this;
    vm.getSearchresults = getSearchResults;
    vm.getAutoSuggestions = getAutoSuggestions;
    vm.gotoPath = goToPath;

    function getSearchResults(term) {
        if (term !== "")
            $state.go('search', {'searchTerm': term});
    }

    function getAutoSuggestions(term) {
        return searchService.getSearchSuggestions(term).then(function (val) {

            if (val !== undefined) {
                val.forEach(function (item) {
                    item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimetype, 24);
                });
                return val;
            } else {
                return [];
            }
        });
    }

    function goToPath(ref) {
        $scope.searchText = '';
        var id = ref.split("/")[3];
        $state.go('document', {doc: id});
    }
}