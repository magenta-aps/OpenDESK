//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.header')
  .controller('HeaderController', ['$scope', '$state', '$mdSidenav', 'headerService', 'userService',
    'notificationsService', HeaderController])

function HeaderController ($scope, $state, $mdSidenav, headerService, userService, notificationsService) {
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
  vm.user = userService.getUser()

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
