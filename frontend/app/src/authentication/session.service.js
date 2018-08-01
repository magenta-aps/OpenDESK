'use strict'

angular
  .module('openDeskApp')
  .factory('sessionService', ['$window', '$state', sessionService])

function sessionService ($window, $state) {
  var service = {
    clearRetainedLocation: clearRetainedLocation,
    getRetainedLocation: getRetainedLocation,
    getUserInfo: getUserInfo,
    login: login,
    saveTicketToSession: saveTicketToSession,
    isAdmin: isAdmin,
    logout: logout,
    makeURL: makeURL,
    retainCurrentLocation: retainCurrentLocation,
    makeAvatarUrl: makeAvatarUrl,
    updateAvatar: updateAvatar
  }

  return service

  function login (user, isSSO) {
    var userInfo = getUserInfo()

    if (isSSO && userInfo === undefined)
      userInfo = {}
    user.avatar = makeAvatarUrl(user)
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
    var sessionTicket = getUserInfo().ticket
    if (sessionTicket)
      return url + (url.indexOf('?') === -1 ? '?' : '&') + 'alf_ticket=' + sessionTicket
    else
      return url
  }

  function retainCurrentLocation () {
    clearRetainedLocation()
    var location = $window.location.href
    if (location === 'login') return

    $window.sessionStorage.setItem('retainedLocation', location)
  }

  function makeAvatarUrl (user) {
    var avatar
    if (user.avatar === undefined) {
      avatar = 'assets/img/avatars/blank-profile-picture.png'
    } else {
      avatar = user.avatar.replace('/thumbnails/avatar', '')
      avatar = makeURL(`/alfresco/s/${avatar}`)
    }

    return avatar
  }

  function updateAvatar (user) {
    var userInfo = getUserInfo()
    userInfo.user.avatar = makeAvatarUrl(user)
    saveUserInfoToSession(userInfo)
    return userInfo.user.avatar
  }
}
