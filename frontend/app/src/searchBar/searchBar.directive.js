'use strict'
import searchBarTemplate from './view/searchBar.html'

angular
  .module('openDeskApp')
  .directive('odSearchBar', function () {
    return {
      restrict: 'E',
      scope: {},
      template: searchBarTemplate,
      controller: 'SearchBarController',
      controllerAs: 'vm'
    }
  })
