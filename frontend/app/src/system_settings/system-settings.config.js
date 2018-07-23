'use strict'
import systemSettingsTemplate from './system_settings.html'
import notificationsTemplate from './notifications/view/notifications.html'
import templateListTemplate from './templates/view/templateList.html'
import filebrowserCardTemplate from './filebrowser/view/filebrowserCard.html'
import configTemplate from './config/view/config.html'
import groupsTemplate from './groups/view/groups.html'
import editTextTemplatesTemplate from './text_templates/view/edit.html'

angular
  .module('openDeskApp.systemsettings')
  .config(['$stateProvider', 'USER_ROLES', config])

function config ($stateProvider, USER_ROLES) {
  $stateProvider.state('systemsettings', {
    parent: 'site',
    url: '/administration',
    params: {
      authorizedRoles: [USER_ROLES.admin]
    },
    views: {
      'content@': {
        template: systemSettingsTemplate,
        controller: 'SystemSettingsController',
        controllerAs: 'vm'
      }
    }
  }).state('systemsettings.notifications', {
    url: '/notifikationer',
    params: {
      authorizedRoles: [USER_ROLES.admin]
    },
    views: {
      'systemsetting-view': {
        template: notificationsTemplate,
        controller: 'NotificationsSettingsController',
        controllerAs: 'vm'
      }
    }
  })
    .state('systemsettings.templateList', {
      url: '/skabeloner',
      params: {
        authorizedRoles: [USER_ROLES.admin]
      },
      views: {
        'systemsetting-view': {
          template: templateListTemplate,
          controller: 'TemplatesController',
          controllerAs: 'vm'
        }
      }
    })
    .state('systemsettings.filebrowser', {
      url: '/systemmapper{path:SlashFix}',
      params: {
        authorizedRoles: [USER_ROLES.admin],
        isSite: false,
        type: 'system-folders'
      },
      views: {
        'systemsetting-view': {
          template: filebrowserCardTemplate,
          controller: 'FilebrowserController',
          controllerAs: 'vm'
        }
      }
    })
    .state('systemsettings.config', {
      url: '/konfiguration',
      params: {
        authorizedRoles: [USER_ROLES.admin]
      },
      views: {
        'systemsetting-view': {
          template: configTemplate,
          controller: 'ConfigController',
          controllerAs: 'vm'
        }
      }
    })
    .state('systemsettings.groups', {
      url: '/grupper',
      params: {
        authorizedRoles: [USER_ROLES.admin]
      },
      views: {
        'systemsetting-view': {
          template: groupsTemplate,
          controller: 'SettingsGroupsController',
          controllerAs: 'vm'
        }
      }
    })
    .state('systemsettings.text_template_edit', {
      url: '/tekstskabelon/{doc:SlashFix}',
      params: {
        authorizedRoles: [USER_ROLES.admin]
      },
      views: {
        'systemsetting-view': {
          template: editTextTemplatesTemplate,
          controller: 'EmailTemplatesController',
          controllerAs: 'vm'
        }
      }
    })
}
