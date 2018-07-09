'use strict';

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
        var userInfo = sessionService.getUserInfo();

        if (userInfo) {
            config.params = config.params || {};
            config.params.alf_ticket = sessionService.getUserInfo().ticket;
        }
        else if (config.url.startsWith("/alfresco") &&
            config.url !== "/alfresco/service/api/login" &&
            config.url !== "/alfresco/s/ssologin" &&
            config.url !== "/alfresco/service/settings/public"
        ){
            config = {};
        }

        return config;

    }

    function prefixAlfrescoServiceUrl(url) {
        if (url.indexOf("/api/") === 0 || url.indexOf("/opendesk/") === 0 || url.indexOf("/slingshot/") === 0 || url.indexOf("/lool") === 0 || url.indexOf("/wopi") === 0 || url == "/touch") {
            return ALFRESCO_URI.webClientServiceProxy + url;
        }
        else if (url.indexOf("/share/") === 0 || url.indexOf("/opendesk/") === 0 || url.indexOf("/slingshot/") === 0 || url == "/touch") {
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
        var $mdDialog = $injector.get('$mdDialog'),
            notificationUtilsService = $injector.get('notificationUtilsService');
        $mdDialog.cancel();
        sessionService.retainCurrentLocation();
        sessionService.logout();
        notificationUtilsService.notify($translate.instant('LOGIN.SESSION_TIMEOUT'));
        delete $window._openDeskSessionExpired;
    }
}

function authService($http, $window, $state, sessionService, userService, notificationsService) {
    var service = {
        login: login,
        logout: logout,
        changePassword: changePassword,
        isAuthenticated: isAuthenticated,
        isAuthorized: isAuthorized,
        getUserInfo: getUserInfo,
        ssoLogin: ssoLogin
    };

    return service;

    function getUserInfo() {
        return sessionService.getUserInfo();
    }

    function ssoLogin() {
        return $http.get("/alfresco/s/ssologin").then(function (response) {
            var username = response.data;
            return userService.getPerson(username).then(function (user) {
                sessionService.login(user, true);
                return user;
            });
        });
    }

    function login(credentials) {
        return $http.post("/api/login", credentials).then(function (response) {
            sessionService.saveTicketToSession(response.data.data.ticket);
            return userService.getPerson(credentials.username).then(function (user) {
                sessionService.login(user, false);
                return user;
            });
        }, function (reason) {
            console.log(reason);
            return reason;
        });
    }

    function logout() {
        var userInfo = sessionService.getUserInfo();
        if (userInfo) {
            var ticket =  userInfo.ticket;
            $http.delete('/api/login/ticket/' + ticket, {alf_ticket: ticket}).then(function (response) {
                sessionService.logout();
                notificationsService.stopUpdate();
                $state.go('login');
            });
        }

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
}