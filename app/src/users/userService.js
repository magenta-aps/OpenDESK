angular
    .module('openDeskApp.users')
    .factory('userService', userService);

function userService($http) {
    return {
        getPerson: getPerson,
        getPeople: getPeople,
        getAuthorities: getAuthorities,
        getPersons: getPersons
    };


    function getPerson(username) {
        return $http.get('/api/people/' + username).then(function (response) {
            return response.data;
        });
    }

    function getHome() {
        return $http.get('/api/nodelocator/userhome').then(function (response) {
            return response.data.data;
        });
    }

    /*
     * gets all authorities
     */
    function getAuthorities() {
        return $http.get('/api/opendesk/authorities').then(function (response) {
            var items = response.data;
            //TODO: remove this temp fix:
            if (items.data && items.data.items) {
                items = items.data.items;
            }
            return Object.keys(items).map(function (key) {
                return items[key];
            });
        });
    }

    function getPeople(filter) {
        return $http.get('/api/people' + filter).then(function (response) {
            return response.data;
        });
    }

    function getPersons(searchTerm) {
        var url = '/api/forms/picker/authority/children?selectableType=cm:person';
        if (searchTerm && searchTerm.length > 0) {
            url += '&searchTerm=' + searchTerm;
        }
        return $http.get(url).then(
            function (result) {
                console.log('got persons (service)');
                console.log(result);
                return result.data.data.items;
            },
            function (err) {
                console.log('no got persons (service)');
                console.log(err);
            }
        );
    }


}
