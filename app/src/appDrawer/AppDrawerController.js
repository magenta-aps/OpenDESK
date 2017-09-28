angular
    .module('openDeskApp.appDrawer')
    .controller('AppDrawerController', AppDrawerController)
    .directive('odAppDrawer', function () {
        return {
            scope: false,
            templateUrl: 'app/src/appDrawer/view/appDrawer.html',
            controller: 'AppDrawerController',
            controllerAs: 'vm'
        };
    });

function AppDrawerController($mdSidenav, pageService, APP_CONFIG) {
    var vm = this;
    vm.links = APP_CONFIG.settings.dashboardLinks;

    vm.pages = [];

    // console.log(APP_CONFIG);
    pageService.addDashboard(vm.pages, 'DASHBOARD.INTRA', vm.links['intra'], "intra","#9c27b0");
    pageService.addDashboard(vm.pages, 'DASHBOARD.EMAIL', vm.links['email'], "mail", "#673ab7");
    pageService.addDashboard(vm.pages, 'DASHBOARD.CALENDAR', vm.links['calendar'], "calendar","#3f51b5");
    pageService.addDashboard(vm.pages, 'DASHBOARD.PROJECTS',  vm.links['projects'], "project","#2196f3");
    pageService.addDashboard(vm.pages, 'DASHBOARD.KEY_NUMBERS', vm.links['keyNumbers'], "timeline","#03a9f4");
    pageService.addDashboard(vm.pages, 'DASHBOARD.WORK_TIME', vm.links['workTime'], "money","#00bcd4");
    pageService.addDashboard(vm.pages, 'DASHBOARD.ESDH', vm.links['esdh'], "library","#009688");
    pageService.addDashboard(vm.pages, 'DASHBOARD.CITRIX', vm.links['citrix'], "business","#4caf50");
    pageService.addDashboard(vm.pages, 'DASHBOARD.MAP', vm.links['map'], "map","#8bc34a");

    vm.close = function () {
        $mdSidenav('appDrawer').close();
    }


}