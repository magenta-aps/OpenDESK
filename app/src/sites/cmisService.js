'use strict';

angular.module('openDeskApp.documents').factory('cmisService', function ($sce, $http) {
    var cmisBaseUrl = '/alfresco/api/-default-/public/cmis/versions/1.1/browser/',
        callback = 'callback=JSON_CALLBACK';

    return {

        getFolderNodes: function (path) {

            var url = cmisBaseUrl + 'root/sites/' + path + '?cmisselector=children&succinct=true';
            $sce.trustAsResourceUrl(url);

            return $http.jsonp(url, {jsonpCallbackParam: 'callback'});
        },

        getNode: function (path) {
            var url = cmisBaseUrl + 'root/sites/' + path + '?cmisselector=object';
            $sce.trustAsResourceUrl(url);

            return $http.jsonp(url, {jsonpCallbackParam: 'callback'});
        },

        getCMISBaseUrl: function () {
            return cmisBaseUrl;
        }

    };
});