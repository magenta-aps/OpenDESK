angular
    .module('openDeskApp.init', ['ngMaterial'])
    .constant('USER_ROLES', {
        admin: 'admin',
        user: 'user'
        //guest: 'guest' we don't want this type of user as of yet
    })
    .constant('ALFRESCO_URI', {
        apiProxy: '/alfresco/api/',
        serviceApiProxy: '/api/',
        serviceSlingshotProxy: '/slingshot/',
        serviceAccessUrl: 'https://staging.opendesk.dk/alfresco/s',
        webClientServiceProxy: '/alfresco/service'
    })
    .constant('PATTERNS', {
        fileName: /^[a-zA-Z0-9_\-,!@#$%^&()=+ ]+$/,
        phone: /^[+]?[0-9\- ]+$/
    })
    .constant('EDITOR_CONFIG', {
        lool : {
            mimeTypes: []
        },
        msOffice: {
            mimeTypes: [
                "application/msword",
                "application/vnd.ms-word",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-word.document.macroenabled.12",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
                "application/vnd.ms-word.template.macroenabled.12",
                "application/msexcel",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
                "application/vnd.ms-excel.sheet.macroenabled.12",
                "application/vnd.ms-excel.template.macroenabled.12",
                "application/vnd.ms-excel.addin.macroenabled.12",
                "application/vnd.ms-excel.sheet.binary.macroenabled.12",
                "application/mspowerpoint",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/vnd.ms-powerpoint.presentation.macroenabled.12",
                "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
                "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
                "application/vnd.openxmlformats-officedocument.presentationml.template",
                "application/vnd.ms-powerpoint.template.macroenabled.12",
                "application/vnd.ms-powerpoint.addin.macroenabled.12",
                "application/vnd.openxmlformats-officedocument.presentationml.slide",
                "application/vnd.ms-powerpoint.slide.macroEnabled.12",
                "application/vnd.visio",
                "application/vnd.visio2013",
                "application/vnd.ms-project"
            ]
        }
    })
    .constant('APP_CONFIG', {
        settings: {},
        sitesUrl: "projekter",
        landingPageState: "dashboard",
        landingPageUrl: "",
        ssoLoginEnabled: true
    })
    .constant('CLIENT_CONFIG', {
        browser: {}
    });