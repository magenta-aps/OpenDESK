angular
    .module('earkApp.dashboard')
    .controller('DashboardController', DashboardController);

function DashboardController(dashboardService) {
    var vm = this;
    vm.dashlets = dashboardService.getDashlets();
}