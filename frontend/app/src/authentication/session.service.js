'use strict'

angular
  .module('openDeskApp')
  .factory('sessionService', ['$window', '$state', 'personService', sessionService])

function sessionService ($window, $state, personService) {
  var service = {
    clearRetainedLocation: clearRetainedLocation,
    getRetainedLocation: getRetainedLocation,
    getUserInfo: getUserInfo,
    login: login,
    saveTicketToSession: saveTicketToSession,
    isAdmin: isAdmin,
    logout: logout,
    makeURL: makeURL,
    retainCurrentLocation: retainCurrentLocation
  }

  return service

  function login (user, isSSO) {
    var userInfo = getUserInfo()

    if (isSSO && userInfo === undefined)
      userInfo = {}
    user.avatar = personService.getAvatarUrl(user)
    user.displayName = user.firstName
    if (user.lastName !== '')
      user.displayName += ' ' + user.lastName
    userInfo.user = user
    saveUserInfoToSession(userInfo)
  }

  function saveTicketToSession (ticket) {
    var userInfo = {}
    userInfo.ticket = ticket
    saveUserInfoToSession(userInfo)
  }

  function saveUserInfoToSession (userInfo) {
    $window.localStorage.setItem('userInfo', angular.toJson(userInfo))
  }

  function isAdmin () {
    var userInfo = getUserInfo()
    if (userInfo === undefined)
      return false

    return userInfo.user.capabilities.isAdmin
  }

  function clearRetainedLocation () {
    $window.sessionStorage.removeItem('retainedLocation')
  }

  function clearUserInfoFromSession () {
    $window.localStorage.removeItem('userInfo')
  }

  function getUserInfo () {
    if ($window.localStorage.getItem('userInfo'))
      return angular.fromJson($window.localStorage.getItem('userInfo'))

    else
      return undefined
  }

  function getRetainedLocation () {
    return $window.sessionStorage.getItem('retainedLocation')
  }

  function logout () {
    clearRetainedLocation()
    clearUserInfoFromSession()
    $state.go('login')
  }

  function makeURL (url) {
    var userInfo = getUserInfo()
    if (userInfo === undefined || userInfo.ticket === undefined)
      return url
    else
      return url + (url.indexOf('?') === -1 ? '?' : '&') + 'alf_ticket=' + userInfo.ticket
  }

  function retainCurrentLocation () {
    clearRetainedLocation()
    var location = $window.location.href
    if (location === 'login') return

    $window.sessionStorage.setItem('retainedLocation', location)
  }
}
