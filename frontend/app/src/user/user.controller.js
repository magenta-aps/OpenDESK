'use strict'
import '../shared/services/preference.service'

angular
  .module('openDeskApp.user')
  .controller('UserController', ['$scope', '$mdSidenav', 'UserService', 'MemberService', 'sessionService',
    'preferenceService', UserController])

function UserController ($scope, $mdSidenav, UserService, MemberService, sessionService, preferenceService) {
  var vm = this

  vm.close = close
  vm.loadAvatar = loadAvatar
  vm.setNotificationPreferences = setNotificationPreferences
  vm.user = UserService.get()

  $scope.uploadAvatar = uploadAvatar

  loadNotificationPreferences()
  loadAvatar()

  function close () {
    $mdSidenav('userpanel').close()
  }

  function loadNotificationPreferences () {
    preferenceService.getNotificationPreferences()
      .then(function (response) {
        vm.receiveNotifications = response
      })
  }

  function setNotificationPreferences () {
    preferenceService.setNotificationPreferences(vm.receiveNotifications)
  }

  function uploadAvatar (element) {
    var file = element.files[0]
    UserService.uploadAvatar(file)
      .then(function (data) {
        loadAvatar()
        return data
      })
  }

  function loadAvatar () {
    MemberService.get(vm.user.userName)
      .then(function (user) {
        vm.user.avatar = sessionService.updateAvatar(user)
      })
  }
}
