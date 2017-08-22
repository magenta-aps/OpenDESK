angular
    .module('openDeskApp')
    .factory('browserService', BrowserService);

function BrowserService(APP_CONFIG) {

    return {
        setTitle : function(pageTitle) {
            var title = APP_CONFIG.settings.appName;
            if(pageTitle !== undefined)
                title += " - " + pageTitle;
            angular.element(window.document)[0].title = title;
        }
    }

}