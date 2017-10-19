angular
    .module('openDeskApp')
    .factory('browserService', BrowserService);

function BrowserService(APP_BACKEND_CONFIG) {

    return {
        setTitle : function(pageTitle) {
            var title = APP_BACKEND_CONFIG.public.appName;
            if(pageTitle !== undefined)
                title += " - " + pageTitle;
            angular.element(window.document)[0].title = title;
        },

        /**
         * detect IE
         * returns version of IE or false, if browser is not Internet Explorer
         */
        isIE : function() {
            var ua = window.navigator.userAgent;

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) { return true; }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) { return true; }

            // We don't accept Edge, as Edge does not support ActiveXObject
            //var edge = ua.indexOf('Edge/');
            //if (edge > 0) { return true; }

            // other browser
            return false;
        }
    }

}