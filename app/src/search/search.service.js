'use strict';

angular
    .module('openDeskApp')
    .factory('searchService', searchService);

function searchService($http) {

    var service = {};

    var Alfresco = {
        apiProxyUrl : '/api/',
        slingshotProxyUrl : '/slingshot/'
    };

    //<editor-fold desc="liveSearch results">
    service.liveSearchCaseDocs = function (term) {
        return $http.get('/openesdh/live-search-caseDocs?t=' + term);
    };

    service.liveSearchCases = function (term) {
        return $http.get('/openesdh/live-search-cases?t='+ term);
    };
    //</editor-fold>

    service.getSearchSuggestions = function (term) {
        return $http.get('/alfresco/s/slingshot/live-search-docs?t=' + term + "*&maxResults=50").then(function (response) {
            return response.data.items;
        })
    };

    service.getSearchResults = function (term) {
        return $http.get('/alfresco/s/slingshot/live-search-docs?t=' + term + "*&maxResults=50").then(function (response) {
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
        return $http.get(Alfresco.slingshotProxyUrl+'search?'+ term).then(function(response) {
            return response.data;
        });
    };

    /**
     * This returns the list of facets configured in the repository for use with the returned results
     */
    service.getConfiguredFacets = function () {
        return $http.get(Alfresco.apiProxyUrl+"facet/facet-config").then(function(response){
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

    service.findPersons = function (searchTerm) {
        var url = ALFRESCO_URI + '/people';
        if(searchTerm && searchTerm.length > 0){
            url += searchTerm;
        }
        url +="?sortBy=lastName&dir=asc&filter=*&maxResults=250";

        return $http.get(url).then(function(result){
            return result.data.people;
        });
    };

    return service;
}