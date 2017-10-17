angular.module('site.list', ['ngMaterial', 'fixed.table.header'])
        .config(config);


function config($stateProvider, APP_CONFIG, USER_ROLES) {

    $stateProvider.state('projects', {
        parent: 'site',
        url: '/' + APP_CONFIG.sitesUrl,
        views: {
            'content@': {
                templateUrl: 'app/src/odSite/siteList/siteList.view.html',
                controller: 'SiteListController',
                controllerAs: 'vm'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }
    });

}