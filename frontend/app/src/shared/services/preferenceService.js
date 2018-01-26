angular
    .module('openDeskApp')
    .factory('preferenceService', preferenceService);

function preferenceService($http, $q, sessionService) {

    var FAVOURITE_CASE = "dk_openesdh_cases_favourites";

    return {
        getAllPreferences: getAllPreferences,
        getPreferences: getPreferences,
        setPreferences: setPreferences,
        removeAllPreferences: removeAllPreferences,
        removePreferences: removePreferences,
        addFavouriteCase: addFavouriteCase,
        removeFavouriteCase: removeFavouriteCase,
        isFavouriteCase: isFavouriteCase,
        _update: _update,
        _url: _url
    };

    // Gets all preferences
    // username: ID of the user
    function getAllPreferences(username) {
        return getPreferences(username, "");
    }

    // Gets preferences matching preferenceFilter
    // username: ID of the user
    // preferenceFilter: Can be "namespaced" by using package notation. For example "dk.magenta.sites.<site_name>.notifications"
    function getPreferences(username, preferenceFilter) {
        return $http.get("/alfresco/service/preferences?username=" + username + "&pf=" + preferenceFilter).then(function(response) {
            return response.data[0];
        })
    }

    // Sets preferences
    // username: ID of the user
    //preferences: JSONArray with namespace(key) and value. For example "dk.magenta.sites.<site_name>.notifications" : "true"
    function setPreferences(username, preferences) {
        return $http.post(this._url(username), preferences).then(function (response) {
            return response.data;
        })
    }

    // Removes all preferences
    // username: ID of the user
    function removeAllPreferences(username) {
        return removePreferences(username, "");
    }

    // Removes preferences matching the filter
    // username: ID of the user
    // preferenceFilter: Can be "namespaced" by using package notation. For example "dk.magenta.sites.<site_name>.notifications"
    function removePreferences(username, preferenceFilter) {
        return $http.post(this._url(username) + "?pf=" + preferenceFilter).then(function(response) {
            return response.data;
        })
    }

    function isFavouriteCase(caseId) {
        return this.getPreferences({pf: FAVOURITE_CASE}).then(function (result) {
            if (result === undefined) {
                return false;
            }
            var values = result[FAVOURITE_CASE];
            var arrValues = values ? values.split(",") : [];
            return arrValues.indexOf(caseId) != -1;
        });
    }

    function addFavouriteCase(caseId) {
        var data = {
            name: FAVOURITE_CASE,
            value: caseId,
            add: true
        };
        return this._update(data);
    }

    function removeFavouriteCase(caseId) {
        var data = {
            name: FAVOURITE_CASE,
            value: caseId,
            add: false
        };
        return this._update(data);
    }

    function _update(preference) {
        var deferred = $q.defer();
        var _this = this;
        this.getPreferences().then(function (preferences) {
            var values = preferences[preference.name];
            var arrValues = values ? values.split(",") : [];
            if (preference.add === true) {
                arrValues.push(preference.value);
            } else {
                var index = arrValues.indexOf(preference.value);
                if (index >= 0) {
                    arrValues.splice(index, 1);
                }
            }
            var preferenceObj = {};
            preferenceObj[preference.name] = arrValues.join(",");
            _this.setPreferences(preferenceObj).then(function (result) {
                deferred.resolve(result);
            });
        });
        return deferred.promise;
    }

    function _url(username) {
        if (username === undefined) {
            var userInfo = sessionService.getUserInfo();
            if (userInfo.user) {
                username = userInfo.user.userName;
            } else {
                return undefined;
            }
        }
        var url = '/api/people/' + username + '/preferences';
        return url;
    }
}