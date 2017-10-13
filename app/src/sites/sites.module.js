angular.module('openDeskApp.sites', ['ngMaterial', 'fixed.table.header'])
        .config(config);


function config($stateProvider, APP_CONFIG, USER_ROLES) {

    $stateProvider.state('projects', {
        parent: 'site',
        url: '/' + APP_CONFIG.sitesUrl,
        views: {
            'content@': {
                templateUrl: 'app/src/sites/view/sites.html',
                controller: 'SitesController',
                controllerAs: 'vm'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }
    });

}