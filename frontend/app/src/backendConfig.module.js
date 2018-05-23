'use strict';

angular
    .module('openDeskApp.backendConfig', [])
    .constant('APP_BACKEND_CONFIG', {
        enableProjects: false,
        enableSites: true,
        enableESDH: false,
        enableChat: false,
        editors: {
            msOffice: false,
            libreOffice: false,
            onlyOffice: false
        },
        dashboardLink: [
            {
                icon: 'intra',
                label: 'Intra',
                url: '',
                newWindow: false
            },
            {
                icon: 'project',
                label: 'Grupperum',
                url: 'grupperum',
                newWindow: false
            },
            {
                icon: 'mail',
                label: 'Mail',
                url: '',
                newWindow: false
            },
            {
                icon: 'library',
                label: 'Dokumenter',
                url: 'dokumenter',
                newWindow: false
            }
        ],
        public: {
            appName: "OpenDesk"
        }
    });