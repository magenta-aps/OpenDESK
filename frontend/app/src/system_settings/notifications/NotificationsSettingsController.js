// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

'use strict'
import '../../shared/services/preference.service'

angular
  .module('openDeskApp.systemsettings')
  .controller('NotificationsSettingsController', ['preferenceService', NotificationsSettingsController])

function NotificationsSettingsController (preferenceService) {
  var vm = this
  vm.setNotificationPreferences = setNotificationPreferences

  loadNotificationPreferences()

  function loadNotificationPreferences () {
    preferenceService.getNotificationPreferences()
      .then(function (response) {
        vm.receiveNotifications = response
      })
  }

  function setNotificationPreferences () {
    preferenceService.setNotificationPreferences(vm.receiveNotifications)
  }
}
