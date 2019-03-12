// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'

angular
  .module('openDeskApp.notifications')
  .controller('NotificationsController', ['$mdSidenav', 'notificationsService', NotificationsController])

function NotificationsController ($mdSidenav, notificationsService) {
  var vm = this

  vm.notifications = []
  vm.close = close
  vm.setRead = setRead
  vm.setSeen = setSeen

  activate()

  function activate () {
    updateNotifications()
    notificationsService.startUpdate(updateNotifications)
  }

  function close () {
    $mdSidenav('notifications').close()
  }

  function setRead (notificationId) {
    notificationsService.setReadNotice(notificationId)
      .then(function () {
        updateNotifications()
      })
  }

  function setSeen (notificationId) {
    notificationsService.setSeenNotice(notificationId)
      .then(function () {
        updateNotifications()
      })
  }

  function updateNotifications () {
    notificationsService.get()
      .then(function (notifications) {
        vm.notifications = notifications
      },
      function (error) {
        if (error.status === 401)
          notificationsService.stopUpdate()
      })
  }
}
