'use strict';

angular
    
    .module('openDeskApp.sites', ['fixed.table.header'])
    .config(config);
    
    function config($stateProvider, USER_ROLES) {
     
        $stateProvider.state('projects', {
            parent: 'site',
            url: '/projekter',
            views: {
                'content@': {
                    templateUrl: 'app/src/sites/view/sites.html',
                    controller: 'SitesController',
                    controllerAs: 'vm'
                }
            },
            data: {
                authorizedRoles: [USER_ROLES.user]
            }
        }).state('project', {
            parent: 'site',
            url: '/projekter/:projekt{path:.*}',
            views: {
                'content@': {
                    templateUrl: 'app/src/sites/view/site.html',
                    controller: 'SiteController',
                    controllerAs: 'vm'
                }
            },
            data: {
                authorizedRoles: [USER_ROLES.user],
                selectedTab: 0
            }
    
        });
        
    }
