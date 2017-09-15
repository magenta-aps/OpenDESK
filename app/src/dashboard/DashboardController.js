angular
    .module('openDeskApp.dashboard')
    .controller('DashboardController', DashboardController);

function DashboardController(pageService, APP_CONFIG) {
    var vm = this;
    vm.links = APP_CONFIG.settings.dashboardLinks;

    vm.pages = [];
    pageService.addPage(vm.pages, 'DASHBOARD.INTRA', vm.links['intra'], "home");
    pageService.addPage(vm.pages, 'DASHBOARD.EMAIL', vm.links['email'], "mail_outline");
    pageService.addPage(vm.pages, 'DASHBOARD.CALENDAR', vm.links['calendar'], "event");
    pageService.addPage(vm.pages, 'DASHBOARD.PROJECTS',  vm.links['projects'], "content_paste");
    pageService.addPage(vm.pages, 'DASHBOARD.KEY_NUMBERS', vm.links['keyNumbers'], "timeline");
    pageService.addPage(vm.pages, 'DASHBOARD.WORK_TIME', vm.links['workTime'], "attach_money");
    pageService.addPage(vm.pages, 'DASHBOARD.ESDH', vm.links['esdh'], "library_books");
    pageService.addPage(vm.pages, 'DASHBOARD.CITRIX', vm.links['citrix'], "business_center");
    pageService.addPage(vm.pages, 'DASHBOARD.MAP', vm.links['map'], "videogame_asset");

}