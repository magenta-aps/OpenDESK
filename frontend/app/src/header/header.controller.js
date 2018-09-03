'use strict'

angular
  .module('openDeskApp.header')
  .controller('HeaderController', ['$scope', '$state', '$mdSidenav', 'headerService', 'UserService',
    'notificationsService', HeaderController])

function HeaderController ($scope, $state, $mdSidenav, headerService, UserService, notificationsService) {
  var vm = this

  vm.title = ''
  vm.toggleAppDrawer = buildToggler('appDrawer')
  vm.toggleNotifications = function () {
    setAllSeen()
    buildToggler('notifications')()
  }
  vm.toggleSystemSettings = toggleSystemSettings
  vm.toggleUserPanel = buildToggler('userpanel')
  vm.unseenNotifications = 0
  vm.user = UserService.get()

  $scope.headerService = headerService
  $scope.notificationsService = notificationsService

  $scope.$watch('headerService.getTitle()', function (newVal) {
    vm.title = newVal
  })

  $scope.$watch('notificationsService.getUnseenCount()', function (newVal) {
    vm.unseenNotifications = newVal
  })

  function toggleSystemSettings () {
    $state.go('systemsettings')
  }

  function buildToggler (navID) {
    return function () {
      $mdSidenav(navID)
        .toggle()
    }
  }

  function setAllSeen () {
    notificationsService.setAllSeen()
      .then(function () {
        updateNotifications()
      })
  }

  function updateNotifications () {
    notificationsService.get()
  }
}
