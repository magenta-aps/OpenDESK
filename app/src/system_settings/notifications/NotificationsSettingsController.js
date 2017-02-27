angular
        .module('openDeskApp.systemsettings')
        .controller('NotificationsSettingsController', NotificationsSettingsController);

function NotificationsSettingsController($mdDialog, $translate, $state, preferenceService, authService) {
    var vm = this;
    var preferenceFilter = "dk.magenta.sites.receiveNotifications";
    vm.receiveNotifications = "true";
    vm.currentUser = authService.getUserInfo().user.userName;

    function loadNotificationPreferences() {
        preferenceService.getPreferences(vm.currentUser, preferenceFilter).then(function(data) {
            if(data[preferenceFilter] != null)
                vm.receiveNotifications = data[preferenceFilter];
            return data[preferenceFilter];
        });
    }
    vm.loadNotificationPreferences = loadNotificationPreferences;
    vm.loadNotificationPreferences();

    function setNotificationPreferences() {
        var preferences = { "dk.magenta.sites.receiveNotifications" : vm.receiveNotifications };

        preferenceService.setPreferences(vm.currentUser, preferences).then(function(data) {
            return data;
        });
    }
    vm.setNotificationPreferences = setNotificationPreferences;
}