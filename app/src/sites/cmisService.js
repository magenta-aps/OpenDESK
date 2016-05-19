'use strict';

angular.module('openDeskApp.documents').factory('cmisService', function ($http) {
  var cmisBaseUrl = '/alfresco/api/-default-/public/cmis/versions/1.1/browser/',
      callback = 'callback=JSON_CALLBACK';

  return {

    getFolderNodes: function (path) {
      return $http.jsonp(cmisBaseUrl + 'root/sites/' + path + '?cmisselector=children&succinct=true&' + callback);
    },

    getNode: function (path) {
      return $http.jsonp(cmisBaseUrl + 'root/sites/' + path + '?cmisselector=object&' + callback);
    },

    getCMISBaseUrl : function(){
      return cmisBaseUrl;
    }

  };
});