angular
    .module('openDeskApp')
    .factory('filterService', filterService);

function filterService($filter) {
    return {
        search: search
    };

    function search(array, query) {
        var hitList = $filter('filter')(array, query);
        return hitList;
    }
}