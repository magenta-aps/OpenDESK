'use strict'

angular
  .module('openDeskApp')
  .factory('authService', authService)

function authService ($http, $window, $state, sessionService, MemberService, notificationsService) {
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
  }

  return service

  function getUserInfo () {
    return sessionService.getUserInfo()
  }

  function ssoLogin () {
    var userInfo = {}
    return $http.get('/alfresco/s/ssologin')
      .then(function (response) {
        var username = response.data
        return $http.get('/api/people/' + username)
          .then(function (response) {
            userInfo.user = response.data
            sessionService.setUserInfo(userInfo)
            return addUserToSession(username)
          }, function (error) {
            console.log(error)
            return error
          })
      })
  }

  function login (username, password) {
    var userInfo = {}
    var payload = {
      username: username,
      password: password
    }
    return $http.post('/api/login', payload)
      .then(function (response) {
        userInfo.ticket = response.data.data.ticket
        sessionService.setUserInfo(userInfo)
        return addUserToSession(username)
      }, function (reason) {
        console.log(reason)
        return reason
      })
  }

  function logout () {
    var userInfo = sessionService.getUserInfo()

    if (userInfo) {
      var ticket = userInfo.ticket
      sessionService.clearRetainedLocation()
      $http.delete('/api/login/ticket/' + ticket, {
        alf_ticket: ticket
      })
        .then(function (response) {
          notificationsService.stopUpdate()
          $state.go('login')
        })
    }
  }

  function loggedin () {
    return sessionService.getUserInfo()
  }

  /**
   * Accepts a user email (which should be unique) bound to a unique user name, recreates a password for the user
   * and emails the user with the details required to login to the system.
   * @param email
   * @returns {*}
   */
  function changePassword (email) {
    return $http.post('/api/opendesk/reset-user-password', {
      email: email
    }).then(function (response) {
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

    return userInfo.user.capabilities.isAdmin ||
      (authorizedRoles.length > 0 && authorizedRoles.indexOf('user') > -1)
  }

  function revalidateUser () {
    return $http.get('/alfresco/s/ssologin').then(function (response) {
      return addUserToSession(response.data)
    })
  }

  function addUserToSession (username) {
    return MemberService.get(username)
      .then(function (user) {
        delete $window._openDeskSessionExpired
        var userInfo = sessionService.getUserInfo()
        userInfo.user = user
        sessionService.setUserInfo(userInfo)
        return user
      })
  }
}
