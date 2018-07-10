angular
        .module('openDeskApp.systemsettings')
        .controller('NotificationsSettingsController', NotificationsSettingsController);

function NotificationsSettingsController($mdDialog, $translate, $state, preferenceService, UserService) {
  var vm = this;

  var preferenceFilter = "dk.magenta.sites.receiveNotifications";
  vm.receiveNotifications = "true";
  vm.currentUser = UserService.get().userName;

  vm.loadNotificationPreferences = loadNotificationPreferences;
  vm.setNotificationPreferences = setNotificationPreferences;

  loadNotificationPreferences();

  function loadNotificationPreferences() {
    preferenceService.getPreferences(vm.currentUser, preferenceFilter)
    .then(function(data) {
      if(data[preferenceFilter] != null)
        vm.receiveNotifications = data[preferenceFilter];
      return data[preferenceFilter];
    });
  }

  function setNotificationPreferences() {
    var preferences = { "dk.magenta.sites.receiveNotifications" : vm.receiveNotifications };

    preferenceService.setPreferences(vm.currentUser, preferences)
    .then(function(data) {
      return data;
    });
  }
}