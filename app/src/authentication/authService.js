angular
    .module('earkApp')
    .factory('httpTicketInterceptor', httpTicketInterceptor)
    .factory('authService', authService);
/*
 function config($httpProvider) {
 $httpProvider.interceptors.push('httpTicketInterceptor');
 $httpProvider.defaults.headers.common.Authorization = undefined;
 $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
 }*/

function httpTicketInterceptor($injector, $translate, $window, $q, sessionService) {
    return {
        request: request,
        response: response,
        responseError: responseError
    };

    function request() {
        /*
         config.url = prefixAlfrescoServiceUrl(config.url);

         if (sessionService.getUserInfo()) {
         config.params = config.params || {};
         config.params.alf_ticket = sessionService.getUserInfo().ticket;
         }

         return config;*/

    }

    function prefixAlfrescoServiceUrl(url) {
        if (url.indexOf("/api/") == 0 || url.indexOf("/openesdh/") == 0 || url.indexOf("/slingshot/") == 0
            || url == "/touch" || url == "/dk-openesdh-case-email") {
            return ALFRESCO_URI.webClientServiceProxy + url;
        }
        return url;
    }

    function response(response) {
        if (response.status == 401 && typeof $window._eArkSessionExpired === 'undefined') {
            sessionExpired();
        }
        return response || $q.when(response);
    }

    function responseError(rejection) {
        //Prevent from popping up the message on failed SSO attempt
        if (rejection.status == 401) {
            sessionExpired();
        }
        return $q.reject(rejection);
    }

    function sessionExpired() {
        if (typeof $window._eArkSessionExpired !== 'undefined')
            return;

        $window._eArkSessionExpired = true;
        sessionService.setUserInfo(null);
        var $mdDialog = $injector.get('$mdDialog'),
            notificationUtilsService = $injector.get('notificationUtilsService');
        $mdDialog.cancel();
        sessionService.retainCurrentLocation();
        $window.location = "/#/login";
        notificationUtilsService.notify($translate.instant('LOGIN.SESSION_TIMEOUT'));
        delete $window._eArkSessionExpired;
    }
}

function authService($http, $window, $state, sessionService, userService) {
    var service = {
        login: login,
        logout: logout,
        loggedin: loggedin,
        isAuthenticated: isAuthenticated,
        getUserInfo: getUserInfo
    };

    return service;

    function getUserInfo() {
        return sessionService.getUserInfo();
    }

    function authFailedSafari(response) {
        return response.data && response.data.indexOf('Safari') != -1;
    }

    function login(username, password) {
        var userInfo = {};
        var user = {userName: username, password: password}
        return $http.get("/").then(function() {
            sessionService.setUserInfo(userInfo);
            return addUserAndParamsToSession(user);
        }, function(reason) {
            console.log(reason);
            return reason;
        });
    }

    function logout() {
        var userInfo = sessionService.getUserInfo();


        if (userInfo) {
            return $http.post('/api/openesdh/logout').then(function (response) {
                sessionService.setUserInfo(null);
                sessionService.clearRetainedLocation();
                oeParametersService.clearOEParameters();
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
        return $http.post("/api/openesdh/reset-user-password", {email: email}).then(function (response) {
            return response;
        });
    }

    function isAuthenticated() {
        return sessionService.getUserInfo();
    }

    function addUserAndParamsToSession(user) {
        return userService.getPersonDB(user).then(function (user) {
            delete $window._eArkSessionExpired;

            var userInfo = sessionService.getUserInfo();
            userInfo['user'] = user;
            sessionService.setUserInfo(userInfo);
            //oeParametersService.loadParameters();
            return user;

        });
    }
}