angular
    .module('openDeskApp.dashboard')
    .controller('DashboardController', DashboardController);

function DashboardController(dashboardService, pageService, APP_CONFIG) {
    var vm = this;
    vm.dashlets = dashboardService.getDashlets();
    vm.links = APP_CONFIG.settings.dashboardLinks;

    vm.pages = [];
    pageService.addPage(vm.pages, 'DASHBOARD.INTRA', vm.links[0], "home");
    pageService.addPage(vm.pages, 'DASHBOARD.EMAIL', vm.links[1], "mail_outline");
    pageService.addPage(vm.pages, 'DASHBOARD.CALENDAR', vm.links[2], "event");
    pageService.addPage(vm.pages, 'DASHBOARD.PROJECTS',  vm.links[3], "content_paste");
    pageService.addPage(vm.pages, 'DASHBOARD.KEY_NUMBERS', vm.links[4], "timeline");
    pageService.addPage(vm.pages, 'DASHBOARD.WORK_TIME', vm.links[5], "attach_money");
    pageService.addPage(vm.pages, 'DASHBOARD.ESDH', vm.links[6], "library_books");
    pageService.addPage(vm.pages, 'DASHBOARD.CITRIX', vm.links[7], "business_center");
    pageService.addPage(vm.pages, 'DASHBOARD.MAP', vm.links[8], "videogame_asset");

}