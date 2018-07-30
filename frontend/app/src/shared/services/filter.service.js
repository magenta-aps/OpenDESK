angular
  .module('openDeskApp')
  .factory('filterService', ['$filter', filterService])

function filterService ($filter) {
  return {
    search: search
  }

  function search (array, query) {
    return $filter('filter')(array, query)
  }
}
