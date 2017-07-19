angular
    .module('openDeskApp.systemsettings', ['ngMaterial', 'pascalprecht.translate'])
    .config(config);

function config(systemSettingsPagesServiceProvider, $stateProvider, USER_ROLES) {
    systemSettingsPagesServiceProvider.addPage('Projektskabeloner', 'administration.systemsettings.templateList', true);
    systemSettingsPagesServiceProvider.addPage('Mappeskabeloner', 'administration.systemsettings.folder_templates', true);
    systemSettingsPagesServiceProvider.addPage('Dokumentskabeloner', 'administration.systemsettings.document_templates', true);

    $stateProvider.state('administration.systemsettings', {
        url: '/systemopsætning',
        params: {
            authorizedRoles: [USER_ROLES.admin]
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
        params: {
            authorizedRoles: [USER_ROLES.admin]
        },
        views: {
            'systemsetting-view': {
                templateUrl: 'app/src/system_settings/notifications/view/notifications.html',
                controller: 'NotificationsSettingsController',
                controllerAs: 'vm'
            }
        }
    }).state('administration.systemsettings.folder_templates', {
        url: '/mappeskabeloner',
        params: {
            authorizedRoles: [USER_ROLES.admin],
            folderPath: "Data Dictionary/Space Templates",
            isSite: false
        },
        views: {
            'systemsetting-view': {
                templateUrl: 'app/src/filebrowser/view/filebrowserCard.html',
                controller: 'FilebrowserController',
                controllerAs: 'fc'
            }
        }
    }).state('administration.systemsettings.document_templates', {
        url: '/dokumentskabeloner',
        params: {
            authorizedRoles: [USER_ROLES.admin],
            folderPath: "Data Dictionary/Node Templates",
            isSite: false
        },
        views: {
            'systemsetting-view': {
                templateUrl: 'app/src/filebrowser/view/filebrowser.html',
                controller: 'FilebrowserController',
                controllerAs: 'fc'
            }
        }
    }).state('administration.systemsettings.templateList', {
        url: '/skabeloner',
        params: {
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
        params: {
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