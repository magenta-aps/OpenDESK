'use strict'
import '../shared/services/file.service'

angular
  .module('openDeskApp.searchBar')
  .controller('SearchBarController', ['$scope', '$state', '$interval', '$translate', '$stateParams', 'searchService',
    'fileService', 'translateService', SearchBarController])

function SearchBarController ($scope, $state, $interval, $translate, $stateParams, searchService, fileService,
  translateService) {
  var vm = this
  vm.getLiveSearch = getLiveSearch
  vm.goToDocument = goToDocument
  vm.goToSearchPage = goToSearchPage

  activate()

  function activate () {
    vm.sitesName = translateService.getSitesName()
  }

  function getLiveSearch (term) {
    return searchService.documentLiveSearch(term).then(function (response) {
      var results = response.items

      if (results !== undefined) {
        results.forEach(function (item) {
          item.thumbNailURL = fileService.getFileIconByMimetype(item.mimetype, 24)
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
