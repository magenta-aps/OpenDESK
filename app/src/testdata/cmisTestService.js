'use strict';

angular.module('openDeskApp.testdata').factory('cmisTestService', function ($http, $sce) {
  var cmisBaseUrl = '/alfresco/api/-default-/public/cmis/versions/1.1/browser/',
      callback = 'callback=JSON_CALLBACK';

  return {

    getFolderNodes: function (path) {

      var url = "cmisBaseUrl + 'root/sites/' + path + '?cmisselector=children&succinct=true&' + callback";
      $sce.trustAsResourceUrl(url);

      return $http.jsonp(cmisBaseUrl + 'root/sites/' + path + '?cmisselector=children&succinct=true&' + callback);
    },

    getNode: function (path) {
      console.log("tadaaaaa")

      var url = "cmisBaseUrl + 'root/sites/' + path + '?cmisselector=object&' + callback)";

      $sce.trustAsResourceUrl(url);

      return $http.jsonp(cmisBaseUrl + 'root/sites/' + path + '?cmisselector=object&' + callback);
    },

    getCMISBaseUrl : function(){
      return cmisBaseUrl;
    }

  };
});