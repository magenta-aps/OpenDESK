'use strict'

angular.module('openDeskApp.site', ['openDeskApp.filebrowser', 'fixed.table.header', 'members', 'odEmail'])
  .config(config)

function config ($stateProvider, APP_CONFIG, USER_ROLES) {
  $stateProvider.state('siteList', {
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
  })
    .state('project', {
      parent: 'site',
      url: '/' + APP_CONFIG.sitesUrl + '/:projekt',
      views: {
        'content@': {
          templateUrl: 'app/src/odSite/siteDetail/siteDetail.view.html',
          controller: 'SiteDetailController',
          controllerAs: 'vm'
        }
      },
      params: {
        authorizedRoles: [USER_ROLES.user],
        path: ''
      },
      redirectTo: 'project.filebrowser'
    })
    .state('project.filebrowser', {
      url: '/dokumenter{path:SlashFix}',
      views: {
        'filebrowser': {
          templateUrl: 'app/src/filebrowser/view/filebrowser.html',
          controller: 'FilebrowserController',
          controllerAs: 'vm'
        }
      },
      params: {
        authorizedRoles: [USER_ROLES.user],
        selectedTab: 0,
        isSite: true
      }
    })
}
