angular
    .module('openDeskApp')
    .factory('sessionService', sessionService);

function sessionService($window) {
    var service = {
        getUserInfo: getUserInfo,
        setUserInfo: setUserInfo,
        isAdmin: isAdmin,
        retainCurrentLocation: retainCurrentLocation,
        getRetainedLocation: getRetainedLocation,
        clearRetainedLocation: clearRetainedLocation,
        isExternalUser: isExternalUser,
        makeURL: makeURL
    };

    init();

    return service;

    var userInfo;

    function init() {
        if ($window.sessionStorage.getItem('userInfo')) {
            userInfo = angular.fromJson($window.sessionStorage.getItem('userInfo'));
        }
    }

    function getUserInfo() {
        return userInfo;
    }

    function setUserInfo(info) {
        userInfo = info;
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
        if (location == '#!/login') {
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
}