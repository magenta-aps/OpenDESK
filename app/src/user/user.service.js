angular
    .module('openDeskApp.user')
    .factory('userService', userService);

function userService($http, sessionService) {

    var showUserPanel = false;

    return {
        toggleUserPanel: toggleUserPanel,
        getUserPanelState: getUserPanelState,
        getPerson: getPerson,
        getUsers: getUsers,
        getAuthorities: getAuthorities,
        getPersons: getPersons,
        uploadAvatar : uploadAvatar,
        getAvatar : getAvatar,
        getAvatarFromUser : getAvatarFromUser
    };

    function toggleUserPanel() {
        showUserPanel = !showUserPanel;
    }

    function getUserPanelState() {
        return showUserPanel;
    }

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

    function getUsers(filter) {
        return $http.post("/alfresco/service/users", {
            PARAM_METHOD : "getUsers",
            PARAM_FILTER: filter
        }).then(function(response) {
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

    function getAvatarFromUser(user) {
        if(user.avatar == undefined)
            return "app/assets/img/avatars/blank-profile-picture.png";
        var avatar = user.avatar.replace("/thumbnails/avatar", "");
        return sessionService.makeURL("/alfresco/s/" + avatar);
    }

    function getAvatar(username) {
        return getPerson(username).then(function (data) {
            return getAvatarFromUser(data);
        });
    }

}
