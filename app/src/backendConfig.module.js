'use strict';

angular
    .module('openDeskApp.backendConfig', [])
    .constant('APP_BACKEND_CONFIG', {
        enableProjects: false,
        enableSites: true,
        enableESDH: false,
        enableChat: false,
        dash: [
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
        dashboardLinks: {
            calendar:"",
            keyNumbers:"",
            projects:"/projekter",
            intra:"",
            workTime:"",
            esdh:"",
            map:"",
            email:"",
            citrix:""
        },
        public: {
            appName: "OpenDesk"
        }
    });