angular
    .module('openDeskApp')
    .factory('avatarUtilsService', avatarUtilsService);

function avatarUtilsService() {
    return {
        getAvatarFromUser : getAvatarFromUser
    };

    function getAvatarFromUser(user) {
        if(user.avatar === undefined)
            return "app/assets/img/avatars/blank-profile-picture.png";
        return user.avatar.replace("/thumbnails/avatar", "");
    }
}