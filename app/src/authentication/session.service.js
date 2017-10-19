'use strict';

angular
    .module('openDeskApp')
    .factory('sessionService', sessionService);

function sessionService($window) {
    var userInfo;

    var service = {
        clearRetainedLocation: clearRetainedLocation,
        getRetainedLocation: getRetainedLocation,
        getUserInfo: getUserInfo,
        isAdmin: isAdmin,
        isExternalUser: isExternalUser,
        loadUserInfo: loadUserInfo,
        makeURL: makeURL,
        retainCurrentLocation: retainCurrentLocation,
        setUserInfo: setUserInfo
    };

    return service;

    /////////

    function isAdmin() {
        if (userInfo == null || userInfo == undefined) {
            return false;
        }
        return userInfo.user.capabilities.isAdmin;
    }

    function clearRetainedLocation() {
        $window.sessionStorage.setItem('retainedLocation', "");
    }

    function getUserInfo() {
        return userInfo;
    }

    function getRetainedLocation() {
        return $window.sessionStorage.getItem('retainedLocation');
    }

    function isExternalUser() {
        if (userInfo == null || userInfo == undefined) {
            return false;
        }
        var externalUserNameRe = /.+_.+(@.+)?$/
        return externalUserNameRe.test(userInfo.user.userName);
    }

    function loadUserInfo() {
        if ($window.sessionStorage.getItem('userInfo')) {
            userInfo = angular.fromJson($window.sessionStorage.getItem('userInfo'));
        }
    }

    function makeURL(url) {
        if (this.getUserInfo().ticket) {
            return url + (url.indexOf("?") === -1 ? "?" : "&") + "alf_ticket=" + this.getUserInfo().ticket;
        } else {
            return url;
        }
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

    function setUserInfo(info) {
        userInfo = info;
        if (userInfo.user != undefined) {
            userInfo.user.displayName = userInfo.user.firstName;
            if (userInfo.user.lastName != "")
                userInfo.user.displayName += " " + userInfo.user.lastName;
        }
        $window.sessionStorage.setItem('userInfo', angular.toJson(userInfo));
    }
}