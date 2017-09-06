'use strict';

angular.module('openDeskApp.site', ['ngMaterial', 'fixed.table.header'])
        .config(config)
        .run(function ($rootScope, $transitions, $state) {
            $transitions.onSuccess({to:'project'}, function (transition) {
                $state.go('project.filebrowser', { path: '' });
            });
        });

function config($stateProvider, APP_CONFIG, USER_ROLES) {

    $stateProvider.state('project', {
        parent: 'site',
        url: '/' + APP_CONFIG.sitesUrl + '/:projekt',
        views: {
            'content@': {
                templateUrl: 'app/src/sites/view/site.html',
                controller: 'SiteController',
                controllerAs: 'vm'
            }
        },
        params: {
            authorizedRoles: [USER_ROLES.user]
        }

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