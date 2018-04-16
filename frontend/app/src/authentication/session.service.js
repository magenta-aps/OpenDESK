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
        saveUserInfoToSession: saveUserInfoToSession,
        setUserInfo: setUserInfo,
        isAdmin: isAdmin,
        isExternalUser: isExternalUser,
        loadUserInfo: loadUserInfo,
        makeURL: makeURL,
        retainCurrentLocation: retainCurrentLocation,
        makeAvatarUrl: makeAvatarUrl,
        setAndSaveAvatarToUserInfo: setAndSaveAvatarToUserInfo
    };

    return service;

    function setUserInfo(info) {
        userInfo = info;
        if(userInfo.user !== undefined) {
            var avatar = makeAvatarUrl(userInfo.user);
            setAvatarToUserInfo(avatar);
            userInfo.user.displayName = userInfo.user.firstName;
            if (userInfo.user.lastName !== "")
                userInfo.user.displayName += " " + userInfo.user.lastName;
            saveUserInfoToSession(userInfo);
        }
    }

    function saveUserInfoToSession(userInfo){
        $window.sessionStorage.setItem('userInfo', angular.toJson(userInfo));
    }

    function isAdmin() {
        if (userInfo === null || userInfo === undefined) {
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
        if (userInfo === null || userInfo === undefined) {
            return false;
        }
        var externalUserNameRe = /.+_.+(@.+)?$/;
        return externalUserNameRe.test(userInfo.user.userName);
    }

    function loadUserInfo() {
        if ($window.sessionStorage.getItem('userInfo')) {
            userInfo = angular.fromJson($window.sessionStorage.getItem('userInfo'));
        }
    }

    function makeURL(url) {
        if (getUserInfo().ticket) {
            return url + (url.indexOf("?") === -1 ? "?" : "&") + "alf_ticket=" + getUserInfo().ticket;
        } else {
            return url;
        }
    }

    function retainCurrentLocation() {
        clearRetainedLocation();
        var location = $window.location.href;
        if (location === 'login') {
            return;
        }
        $window.sessionStorage.setItem('retainedLocation', location);
    }

    function makeAvatarUrl(user) {
        var avatar;
        if(user.avatar === undefined)
            avatar = "app/assets/img/avatars/blank-profile-picture.png";
        else {
            avatar = user.avatar.replace("/thumbnails/avatar", "");
            avatar = makeURL("/alfresco/s/" + avatar);
        }
        return avatar;
    }

    function setAvatarToUserInfo(avatar) {
        if(userInfo.user !== undefined)
            userInfo.user.avatar = avatar;
    }

    function setAndSaveAvatarToUserInfo(user) {
        var avatar = makeAvatarUrl(user);
        setAvatarToUserInfo(avatar);
        saveUserInfoToSession(userInfo);
    }
}