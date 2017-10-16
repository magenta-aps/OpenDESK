angular.module('site.detail', ['ngMaterial', 'fixed.table.header'])
        .config(config);

function config($stateProvider, APP_CONFIG, USER_ROLES) {

    $stateProvider.state('project', {
        parent: 'site',
        url: '/' + APP_CONFIG.sitesUrl + '/:projekt',
        views: {
            'content@': {
                templateUrl: 'app/src/odSiteDetail/siteDetail.view.html',
                controller: 'SiteDetailController',
                controllerAs: 'vm'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user],
            path: ""
        },
        redirectTo: 'project.filebrowser'
    })
    .state('project.filebrowser', {
        url: '/dokumenter{path:any}',
        views: {
            'filebrowser': {
                templateUrl: 'app/src/filebrowser/view/filebrowser.html',
                controller: 'FilebrowserController',
                controllerAs: 'fc'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user],
            selectedTab: 0,
            folderNodeRef: null,
            isSite: true
        }
    }).state('project.discussions', {
        url: '/diskussioner',
        params: {
            selectedTab: 1
        },
        views: {
            'discussions': {
                templateUrl: 'app/src/odDiscussion/view/overview.html',
                controller: 'DiscussionController',
                controllerAs: 'dc'
            }
        }
    })
    .state('project.viewthread', {
        url: '/diskussioner/{path:any}',
        params: {
            selectedTab: 1
        },
        views: {
            'discussions': {
                templateUrl: 'app/src/odDiscussion/view/conversation.html',
                controller: 'DiscussionController',
                controllerAs: 'dc'
            }
        }
    });
}