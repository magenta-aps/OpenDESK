// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

angular
  .module('openDeskApp')
  .factory('preferenceService', ['$http', '$q', 'userService', preferenceService])

function preferenceService ($http, $q, userService) {
  var preferenceFilter = 'dk.magenta.sites.receiveNotifications'

  return {
    getNotificationPreferences: getNotificationPreferences,
    setNotificationPreferences: setNotificationPreferences,
    getPreferences: getPreferences,
    setPreferences: setPreferences
  }

  function getNotificationPreferences () {
    return getPreferences(preferenceFilter)
      .then(function (data) {
      // If the preference is set then return it
        if (data[preferenceFilter] != null)
          return data[preferenceFilter]
        // Otherwise return default value; true
        return true
      })
  }

  function setNotificationPreferences (value) {
    var preferences = { 'dk.magenta.sites.receiveNotifications': value }
    setPreferences(preferences)
  }

  // Gets preferences matching preferenceFilter
  // preferenceFilter: Can be "namespaced" by using package notation. For example "dk.magenta.sites.<site_name>.notifications"
  function getPreferences (preferenceFilter) {
    return $http.get('/alfresco/service/preferences?pf=' + preferenceFilter).then(function (response) {
      return response.data[0]
    })
  }

  // Sets preferences
  // username: ID of the user
  // preferences: JSONArray with namespace(key) and value. For example "dk.magenta.sites.<site_name>.notifications" : "true"
  function setPreferences (preferences) {
    var username = userService.getUser().userName
    return $http.post('/api/people/' + username + '/preferences', preferences).then(function (response) {
      return response.data
    })
  }
}
