angular
    .module('openDeskApp.dashboard')
    .controller('DashboardController', DashboardController);

function DashboardController(pageService, headerService, APP_CONFIG) {
    var vm = this;
    vm.links = APP_CONFIG.settings.dashboardLinks;

    headerService.setTitle('');

    vm.pages = [];
    pageService.addDashboard(vm.pages, 'DASHBOARD.INTRA', vm.links['intra'], "home","#b9f6ca");
    pageService.addDashboard(vm.pages, 'DASHBOARD.EMAIL', vm.links['email'], "mail_outline", "#ffff8d");
    pageService.addDashboard(vm.pages, 'DASHBOARD.CALENDAR', vm.links['calendar'], "event","#84ffff");
    pageService.addDashboard(vm.pages, 'DASHBOARD.PROJECTS',  vm.links['projects'], "content_paste","#80d8ff");
    pageService.addDashboard(vm.pages, 'DASHBOARD.KEY_NUMBERS', vm.links['keyNumbers'], "timeline","#448aff");
    pageService.addDashboard(vm.pages, 'DASHBOARD.WORK_TIME', vm.links['workTime'], "attach_money","#b388ff");
    pageService.addDashboard(vm.pages, 'DASHBOARD.ESDH', vm.links['esdh'], "library_books","#8c9eff");
    pageService.addDashboard(vm.pages, 'DASHBOARD.CITRIX', vm.links['citrix'], "business_center","#ff8a80");
    pageService.addDashboard(vm.pages, 'DASHBOARD.MAP', vm.links['map'], "videogame_asset","#ff80ab");

}