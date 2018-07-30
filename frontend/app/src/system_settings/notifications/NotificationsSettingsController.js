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
