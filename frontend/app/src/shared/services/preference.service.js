angular
  .module('openDeskApp')
  .factory('preferenceService', ['$http', '$q', 'UserService', preferenceService])

function preferenceService ($http, $q, UserService) {
  var preferenceFilter = 'dk.magenta.sites.receiveNotifications'

  return {
    getNotificationPreferences: getNotificationPreferences,
    setNotificationPreferences: setNotificationPreferences,
    getPreferences: getPreferences,
    setPreferences: setPreferences,
    _url: _url
  }

  function getNotificationPreferences () {
    var userName = getUserName()
    return getPreferences(userName, preferenceFilter)
      .then(function (data) {
      // If the preference is set then return it
        if (data[preferenceFilter] != null)
          return data[preferenceFilter]
        // Otherwise return default value; true
        return true
      })
  }

  function setNotificationPreferences (value) {
    var userName = getUserName()
    var preferences = { 'dk.magenta.sites.receiveNotifications': value }
    setPreferences(userName, preferences)
  }

  function getUserName () {
    return UserService.get().userName
  }

  // Gets preferences matching preferenceFilter
  // username: ID of the user
  // preferenceFilter: Can be "namespaced" by using package notation. For example "dk.magenta.sites.<site_name>.notifications"
  function getPreferences (username, preferenceFilter) {
    return $http.get('/alfresco/service/preferences?username=' + username + '&pf=' + preferenceFilter).then(function (response) {
      return response.data[0]
    })
  }

  // Sets preferences
  // username: ID of the user
  // preferences: JSONArray with namespace(key) and value. For example "dk.magenta.sites.<site_name>.notifications" : "true"
  function setPreferences (username, preferences) {
    return $http.post(this._url(username), preferences).then(function (response) {
      return response.data
    })
  }

  function _url (username) {
    if (username === undefined) {
      var userInfo = UserService.get()
      if (userInfo)
        username = userInfo.userName
      else
        return undefined
    }
    return '/api/people/' + username + '/preferences'
  }
}
