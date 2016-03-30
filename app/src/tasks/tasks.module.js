
    angular.module('earkApp.tasks', [
        'ngMaterial', 
        'earkApp.tasks.common',
        'earkApp.adhoc.tasks',
        'earkApp.activitiReview.tasks',
        'earkApp.activitiParallelReview.tasks',
        'earkApp.sequentialReview.tasks'
    ]).config(config);
    
    function config(dashboardServiceProvider, modulesMenuServiceProvider){
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