angular
    .module('openDeskApp.systemsettings', ['ngMaterial', 'pascalprecht.translate'])
    .config(config);

function config(systemSettingsPagesServiceProvider, $stateProvider, USER_ROLES) {
    systemSettingsPagesServiceProvider.addPage('Skabeloner', 'administration.systemsettings.templateList', true);
    systemSettingsPagesServiceProvider.addPage('Notifikationer', 'administration.systemsettings.notifications', false);

    $stateProvider.state('administration.systemsettings', {
        url: '/systemopsætning',
        data: {
            authorizedRoles: [USER_ROLES.user],
            selectedTab: 4
        },
        views: {
            'systemsettings': {
                templateUrl: 'app/src/system_settings/system_settings.html',
                controller: 'SystemSettingsController',
                controllerAs: 'vm'
            }
        }
    }).state('administration.systemsettings.notifications', {
        url: '/notifikationer',
        data: {
            authorizedRoles: [USER_ROLES.user]
        },
        views: {
            'systemsetting-view': {
                templateUrl: 'app/src/system_settings/notifications/view/notifications.html',
                controller: 'NotificationsSettingsController',
                controllerAs: 'vm'
            }
        }
    }).state('administration.systemsettings.templateList', {
        url: '/skabeloner',
        data: {
            authorizedRoles: [USER_ROLES.admin]
        },
        views: {
            'systemsetting-view': {
                templateUrl: 'app/src/system_settings/templates/view/templateList.html',
                controller: 'TemplatesController',
                controllerAs: 'vm'
            }
        }
    }).state('administration.systemsettings.editTemplate', {
        url: '/skabelon',
        data: {
            authorizedRoles: [USER_ROLES.admin]
        },
        views: {
            'systemsetting-view': {
                templateUrl: 'app/src/system_settings/templates/view/editTemplate.html',
                controller: 'TemplatesController',
                controllerAs: 'vm'
            }
        }
    });
}