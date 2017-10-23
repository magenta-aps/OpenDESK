angular
    .module('openDeskApp')
    .factory('sessionService', sessionService);

function sessionService($window, avatarUtilsService) {
    var userInfo;
    var service = {
        loadUserInfo: loadUserInfo,
        getUserInfo: getUserInfo,
        saveUserInfoToSession: saveUserInfoToSession,
        setUserInfo: setUserInfo,
        isAdmin: isAdmin,
        retainCurrentLocation: retainCurrentLocation,
        getRetainedLocation: getRetainedLocation,
        clearRetainedLocation: clearRetainedLocation,
        isExternalUser: isExternalUser,
        makeURL: makeURL,
        makeAvatarUrl: makeAvatarUrl,
        setAvatar: setAvatar
    };
    
    return service;

    function loadUserInfo() {
        if ($window.sessionStorage.getItem('userInfo')) {
            userInfo = angular.fromJson($window.sessionStorage.getItem('userInfo'));
        }
    }

    function getUserInfo() {
        return userInfo;
    }

    function setUserInfo(info) {
        userInfo = info;
        if(userInfo.user !== undefined) {
            var avatar = avatarUtilsService.getAvatarFromUser(userInfo.user);
            this.makeAvatarUrl(avatar);
            userInfo.user.displayName = userInfo.user.firstName;
            if (userInfo.user.lastName != "")
                userInfo.user.displayName += " " + userInfo.user.lastName;
            this.saveUserInfoToSession(userInfo);
        }
    }

    function saveUserInfoToSession(userInfo){
        $window.sessionStorage.setItem('userInfo', angular.toJson(userInfo));
    }

    function isAdmin() {
        if (userInfo == null || userInfo == undefined) {
            return false;
        }
        return userInfo.user.capabilities.isAdmin;
    }

    function retainCurrentLocation() {
        this.clearRetainedLocation();
        var location = $window.location.hash;
        location = location.replace("#!#!%2F", "#!/");
        if (location === '#!/login') {
            return;
        }
        $window.sessionStorage.setItem('retainedLocation', location);
    }

    function getRetainedLocation() {
        return $window.sessionStorage.getItem('retainedLocation');
    }

    function clearRetainedLocation() {
        $window.sessionStorage.setItem('retainedLocation', "");
    }

    function isExternalUser() {
        if (userInfo == null || userInfo == undefined) {
            return false;
        }
        var externalUserNameRe = /.+_.+(@.+)?$/
        return externalUserNameRe.test(userInfo.user.userName);
    }

    function makeURL(url) {
        if (this.getUserInfo().ticket) {
            return url + (url.indexOf("?") === -1 ? "?" : "&") + "alf_ticket=" + this.getUserInfo().ticket;
        } else {
            return url;
        }
    }

    function makeAvatarUrl(avatar) {
        if(userInfo.user !== undefined)
            userInfo.user.avatar = this.makeURL("/alfresco/s/" + avatar);
    }

    function setAvatar(avatar) {
        this.makeAvatarUrl(avatar);
        this.saveUserInfoToSession(userInfo);
    }
}