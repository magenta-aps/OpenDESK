'use strict';

angular.module('myApp').factory('cmisService', function ($http) {
  var cmisBaseUrl = '/alfresco/api/-default-/public/cmis/versions/1.1/browser/',
      callback = 'callback=JSON_CALLBACK';

  return {

    getChildren: function (path) {
      return $http.jsonp(cmisBaseUrl + 'root/' + path + '?cmisselector=children&succinct=true&' + callback);
    },

    getCMISBaseUrl : function(){
      return cmisBaseUrl;
    }

  };
});