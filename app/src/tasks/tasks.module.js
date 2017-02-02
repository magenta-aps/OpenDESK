angular.module('openDeskApp.tasks', [
    'ngMaterial',
    'openDeskApp.tasks.common',
    'openDeskApp.adhoc.tasks',
    'openDeskApp.activitiReview.tasks',
    'openDeskApp.activitiParallelReview.tasks',
    'openDeskApp.sequentialReview.tasks'
]).config(config);

function config(dashboardServiceProvider, modulesMenuServiceProvider) {
    dashboardServiceProvider.addDashlet({
        templateUrl: 'app/src/tasks/view/tasksDashlet.html',
        position: 'right',
        order: 1
    });
    modulesMenuServiceProvider.addItem({
        templateUrl: 'app/src/tasks/view/menuItem.html',
        order: 3
    });
}