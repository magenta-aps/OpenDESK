// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp')
  .factory('authService', ['$http', '$window', '$state', 'personService', 'sessionService', authService])

function authService ($http, $window, $state, personService, sessionService) {
  var service = {
    login: login,
    logout: logout,
    changePassword: changePassword,
    isAuthenticated: isAuthenticated,
    isAuthorized: isAuthorized,
    getUserInfo: getUserInfo,
    ssoLogin: ssoLogin
  }

  return service

  function getUserInfo () {
    return sessionService.getUserInfo()
  }

  function ssoLogin () {
    return $http.get('/alfresco/s/authentication/ssologin').then(function (response) {
      var username = response.data
      return personService.getPerson(username)
        .then(function (user) {
          sessionService.login(user, true)
          return user
        })
    })
  }

  function login (credentials) {
    return $http.post('/api/login', credentials)
      .then(function (response) {
        sessionService.saveTicketToSession(response.data.data.ticket)
        return personService.getPerson(credentials.username).then(function (user) {
          sessionService.login(user, false)
          return user
        })
      }, function (reason) {
        console.log(reason)
        return reason
      })
  }

  function logout () {
    var userInfo = sessionService.getUserInfo()
    if (userInfo) {
      var ticket = userInfo.ticket
      $http.delete('/api/login/ticket/' + ticket, {alf_ticket: ticket}).then(function () {
        sessionService.logout()
      })
    }
  }

  /**
     * Accepts a user email (which should be unique) bound to a unique user name, recreates a password for the user
     * and emails the user with the details required to login to the system.
     * @param email
     * @returns {*}
     */
  function changePassword (email) {
    return $http.post('/api/opendesk/reset-user-password', {email: email}).then(function (response) {
      return response
    })
  }

  function isAuthenticated () {
    return sessionService.getUserInfo()
  }

  function isAuthorized (authorizedRoles) {
    var userInfo = sessionService.getUserInfo()
    if (typeof userInfo === 'undefined')
      return false

    if (!angular.isArray(authorizedRoles))
      authorizedRoles = [authorizedRoles]

    return userInfo.user.isAdmin ||
            (authorizedRoles.length > 0 && authorizedRoles.indexOf('user') > -1)
  }
}
