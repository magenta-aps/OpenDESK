'use strict';

angular.module('openDeskApp.search').factory('searchService', function ($http, $window, alfrescoNodeUtils) {
    var restBaseUrl = '/alfresco/s/api/';
    //var restBaseUrl = '/alfresco/s/slingshot/auto-suggest';
    //alfresco/s/slingshot/auto-suggest?t={term}&limit={limit?}
    return {

        getSearchSuggestions: function (term) {
            return $http.get( '/alfresco/s/slingshot/auto-suggest?t=' + term).then(function (response) {
                return response.data.suggestions;
            })
        },
        getSearchResults: function (term) {
            return $http.get( '/alfresco/s/slingshot/live-search-docs?t=' + term).then(function (response) {
                return response.data.suggestions;
            })
        }
    };
});