angular
  .module('openDeskApp')
  .controller('SearchBarController', SearchBarController)

function SearchBarController ($scope, $state, $interval, $translate, $stateParams, searchService, fileUtilsService,
                              translateService) {
  var vm = this
  vm.getLiveSearch = getLiveSearch
  vm.goToDocument = goToDocument
  vm.goToSearchPage = goToSearchPage

    activate();

    function activate() {
        vm.sitesName = translateService.getSitesName();
    }

  function getLiveSearch (term) {
    return searchService.documentLiveSearch(term).then(function (response) {
      var results = response.items

      if (results !== undefined) {
        results.forEach(function (item) {
          item.thumbNailURL = fileUtilsService.getFileIconByMimetype(item.mimetype, 24)
        })
        return results
      } else {
        return []
      }
    })
  }

  function goToDocument (ref) {
    $scope.searchText = ''
    var id = ref.split('/')[3]
    $state.go('document', {doc: id})
  }

  function goToSearchPage (term) {
    if (term !== '')
      $state.go('search', {'searchTerm': term})
  }
}
