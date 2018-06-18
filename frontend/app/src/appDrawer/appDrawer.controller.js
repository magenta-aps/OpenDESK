'use strict';

angular
    .module('openDeskApp.appDrawer')
    .controller('AppDrawerController', AppDrawerController);

function AppDrawerController($mdSidenav, pageService, APP_BACKEND_CONFIG) {
    var vm = this;
    
    vm.close = close;
    vm.links = APP_BACKEND_CONFIG.dashboardLink;

    function close() {
        $mdSidenav('appDrawer').close();
    }
}