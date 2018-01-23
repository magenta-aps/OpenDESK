'use strict';

angular
    .module('openDeskApp.search')
    .factory('searchService', searchService);

function searchService($http) {

    var service = {};

    service.getSearchSuggestions = function (term) {
        return $http.get('/alfresco/s/slingshot/live-search-docs?t=' + term + "*&maxResults=5").then(function (response) {
            return response.data.items;
        })
    };

    service.getSearchResults = function (term) {
        return $http.get('/alfresco/s/slingshot/live-search-docs?t=' + term + "*&maxResults=5").then(function (response) {
            return response;
        })
    };

    /**
     * Could we just use the live search results and return a concatenation of the results??
     * Thoughts: What about faceting?
     *
     * @param term
     * @returns {*}
     */
    service.search = function (term) {
        return $http.get('/slingshot/search?'+ term).then(function(response) {
            return response.data;
        });
    };

    /**
     * This returns the list of facets configured in the repository for use with the returned results
     */
    service.getConfiguredFacets = function () {
        return $http.get("/api/facet/facet-config").then(function(response){
            var rawFacets = response.data.facets;
            var facets=[];
            rawFacets.forEach(function(facet){
                if (facet.isEnabled){
                    facets.push(facet);
                }
            });

            return facets;
        });
    };

    return service;
}