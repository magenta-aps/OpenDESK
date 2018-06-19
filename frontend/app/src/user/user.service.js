angular
    .module('openDeskApp.user')
    .factory('userService', userService);

function userService($http) {

    return {
        uploadAvatar: uploadAvatar
    };

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
}
