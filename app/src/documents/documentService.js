
    angular
        .module('openDeskApp.documents')
        .factory('documentService', documentService);

    function documentService($http) {
        var service = {
            getDocuments: getDocuments,
            getFavoriteDocuments: getFavoriteDocuments
        };

        return service;

        function getDocuments() {
           // http://localhost:8080/alfresco/api/-default-/public/cmis/versions/1.0/atom
            return $http.get('/api/-default-/public/cmis/versions/1.0/atom/children?id=94c021ce-bb09-4642-b860-2076e7f3c5b0', {
                //params: {max: 50, filter: 'recentlyModifiedByMe'}
            }).then(function(response) {
                return response.data;
            });
        }

        function getFavoriteDocuments() {
            return $http.get('/slingshot/doclib/doclist/documents/node/alfresco/company/home', {
                params: {max: 50, filter: 'favourites'}
            }).then(function(response) {
                console.log(response);
                return response.data;
            });
        }

        function getEditingDocuments() {
            return $http.get('/slingshot/doclib/doclist/documents/node/alfresco/company/home', {
                params: {
                    max: 50,
                    filter: 'editingMe'
                }
            }).then(function(response) {
                console.log(response);
                return response.data;
            });
        }
    }