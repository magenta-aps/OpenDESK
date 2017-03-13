angular
    .module('openDeskApp')
    .config(config)
    .factory('httpTicketInterceptor', httpTicketInterceptor)
    .factory('authService', authService);

function config($httpProvider) {
    $httpProvider.interceptors.push('httpTicketInterceptor');
    $httpProvider.defaults.headers.common.Authorization = undefined;
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}

function httpTicketInterceptor($injector, $translate, $window, $q, sessionService, ALFRESCO_URI) {
    return {
        request: request,
        response: response,
        responseError: responseError
    };

    function request(config) {

        config.url = prefixAlfrescoServiceUrl(config.url);

        if (sessionService.getUserInfo()) {
            config.params = config.params || {};
            config.params.alf_ticket = sessionService.getUserInfo().ticket;
        }

        return config;

    }

    function prefixAlfrescoServiceUrl(url) {
        if (url.indexOf("/api/") == 0 || url.indexOf("/opendesk/") == 0 || url.indexOf("/slingshot/") == 0
            || url.indexOf("/lool") == 0 || url.indexOf("/wopi") == 0 || url == "/touch") {
            return ALFRESCO_URI.webClientServiceProxy + url;
        }
        else if (url.indexOf("/share/") == 0 || url.indexOf("/opendesk/") == 0 || url.indexOf("/slingshot/") == 0
            || url == "/touch") {
            return ALFRESCO_URI.webClientServiceProxy + url;
        }
        return url;
    }

    function response(response) {
        if (response.status == 401 && typeof $window._openDeskSessionExpired === 'undefined') {
            sessionExpired();
        }
        return response || $q.when(response);
    }

    function responseError(rejection) {
        //Prevent from popping up the message on failed SSO attempt
        if (rejection.status == 401 && rejection.config.url.indexOf("/touch") == -1) {
            sessionExpired();
        }
        return $q.reject(rejection);
    }

    function sessionExpired() {
        if (typeof $window._openDeskSessionExpired !== 'undefined')
            return;

        $window._openDeskSessionExpired = true;
        sessionService.setUserInfo(null);
        var $mdDialog = $injector.get('$mdDialog'),
            notificationUtilsService = $injector.get('notificationUtilsService');
        $mdDialog.cancel();
        sessionService.retainCurrentLocation();
        $window.location = "/#!/login";
        notificationUtilsService.notify($translate.instant('LOGIN.SESSION_TIMEOUT'));
        delete $window._openDeskSessionExpired;
    }
}

function authService($http, $window, $state, sessionService, userService) {
    var service = {
        login: login,
        logout: logout,
        loggedin: loggedin,
        changePassword: changePassword,
        isAuthenticated: isAuthenticated,
        isAuthorized: isAuthorized,
        getUserInfo: getUserInfo,
        revalidateUser: revalidateUser,
        ssoLogin: ssoLogin
    };

    return service;

    function getUserInfo() {
        return sessionService.getUserInfo();
    }

    function ssoLogin() {
        var userInfo = {};
        return $http.get("alfresco/s/ssologin").then(function (response) {
            var username = response.data;
            return $http.get("/api/people/" + username).then(function (response) {
                userInfo.user = response.data;
                sessionService.setUserInfo(userInfo);
                return addUserToSession(username);
            }, function (error) {
                console.log(error);
                return error;
            });
        });
    }

    function authFailedSafari(response) {
        return response.data && response.data.indexOf('Safari') != -1;
    }

    function login(username, password) {
        var userInfo = {};
        return $http.post("/api/login", {
            username: username,
            password: password
        }).then(function (response) {
            userInfo.ticket = response.data.data.ticket;
            sessionService.setUserInfo(userInfo);
            return addUserToSession(username);
        }, function (reason) {
            console.log(reason);
            return reason;
        });
    }

    function logout() {
        var userInfo = sessionService.getUserInfo();


        if (userInfo) {
            return $http.delete('/api/login/ticket/' + userInfo.ticket, {alf_ticket: userInfo.ticket}).then(function (response) {
                sessionService.setUserInfo(null);
                sessionService.clearRetainedLocation();
                return response;
            });
        }

    }

    function loggedin() {
        return sessionService.getUserInfo();
    }

    /**
     * Accepts a user email (which should be unique) bound to a unique user name, recreates a password for the user
     * and emails the user with the details required to login to the system.
     * @param email
     * @returns {*}
     */
    function changePassword(email) {
        return $http.post("/api/opendesk/reset-user-password", {email: email}).then(function (response) {
            return response;
        });
    }

    function isAuthenticated() {
        return sessionService.getUserInfo();
    }

    function isAuthorized(authorizedRoles) {
        var userInfo = sessionService.getUserInfo();
        if (typeof userInfo === 'undefined') {
            return false;
        }
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        //TODO refactor when we have more role types
        //We should loop through each authorized role and return true as soon as we detect a true value
        //As we have only two roles we need only to return whether the user is an admin or return the inverse of
        //user.isAdmin when the user role is set to user (i.e. return true if the user is not admin when the role is
        //user
//        for (var n = 0; n < authorizedRoles.length; n++) {
//            //if admin we don't care return true immediately
//            if (userInfo.user.capabilities.isAdmin)
//                return true;
//            if (authorizedRoles[n] === 'user')
//                return !userInfo.user.capabilities.isAdmin;
//        }
        return userInfo.user.capabilities.isAdmin ||
            (authorizedRoles.length > 0 && authorizedRoles.indexOf('user') > -1);
    }

    function revalidateUser() {
        return $http.get('/api/opendesk/currentUser').then(function (response) {
            return addUserToSession(response.data.userName);
        });
    }

    function addUserToSession(username) {
        return userService.getPerson(username).then(function (user) {
            delete $window._openDeskSessionExpired;
            var userInfo = sessionService.getUserInfo();
            userInfo['user'] = user;
            sessionService.setUserInfo(userInfo);
            return user;
        });
    }
}