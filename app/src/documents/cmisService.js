'use strict';

angular.module('openDeskApp.documents').factory('cmisService', function ($http) {
    var cmisBaseUrl = '/alfresco/api/-default-/public/cmis/versions/1.1/browser/',
        callback = 'callback=JSON_CALLBACK';

    return {

        getChildren: function ($sce, path) {

            var url = cmisBaseUrl + 'root/' + path + '?cmisselector=children&succinct=true';
            $sce.trustAsResourceUrl(url);

            return $http.jsonp(url, {jsonpCallbackParam: 'callback'});
        },

        getCMISBaseUrl: function () {
            return cmisBaseUrl;
        }

    };
});