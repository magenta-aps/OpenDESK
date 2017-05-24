angular
    .module('openDeskApp.users')
    .factory('userService', userService);

function userService($http, sessionService) {
    return {
        getPerson: getPerson,
        getPeople: getPeople,
        getAuthorities: getAuthorities,
        getPersons: getPersons,
        uploadAvatar : uploadAvatar,
        getAvatar : getAvatar
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

    function uploadAvatar(file, username) {

        var formData = new FormData();
        formData.append("filedata", file);
        formData.append("username", username);

        return $http.post("/alfresco/service/slingshot/profile/uploadavatar", formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function (response) {
            return response;
        });
    }

    function getAvatar(username) {
        if(username == undefined)
            return "http://placehold.it/128x128";
        return getPerson(username).then(function (data) {
            if(data.avatar == undefined)
                return "http://placehold.it/128x128";

            var avatar = data.avatar.replace("/thumbnails/avatar", "");
            console.log('get avatar sidebar');
            console.log(avatar);
            return sessionService.makeURL("/alfresco/s/" + avatar);
        });
    }

}
