'use strict';

angular
    .module('openDeskApp.backendConfig', [])
    .constant('APP_BACKEND_CONFIG', {
        enableProjects: false,
        enableSites: true,
        enableESDH: false,
        enableChat: false,
        dashboardLink: [
            {
                icon: 'intra',
                label: 'Intra',
                url: '',
                newWindow: false
            },
            {
            icon: 'project',
            label: 'Projekter',
            url: '/projekter',
            newWindow: true
        },
        {
            icon: 'mail',
            label: 'Mail',
            url: '',
            newWindow: false
        },
        ],
        public: {
            appName: "OpenDesk"
        }
    });