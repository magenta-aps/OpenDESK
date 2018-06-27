angular
    .module('openDeskApp.lool')
    .factory('loolService', loolService);


function loolService($http, transformRequestAsFormPost, ALFRESCO_URI) {

    return {
        getWopiUrl: getWopiUrl,
        getIframeSrc: getIframeSrc,
        getLoolServiceUrl: getLoolServiceUrl,
        getValidMimeTypes: getValidMimeTypes
    };

    //Just in case this is set. Call the server and see if the service url is set get around proxy issues
    function getLoolServiceUrl() {
        return $http.get('/lool/host/url')
            .then(function (response) {
                return response.data.lool_host_url;
            })
            .catch(function (response) {
                console.log('WARNING: Unable to get service url for the alfresco backend. Attempt returned with:\n' +
                    response + '\nResorting to using the set default:' + ALFRESCO_URI.serviceAccessUrl);
                return ALFRESCO_URI.serviceAccessUrl;
            })

    }

    function getWopiUrl(nodeRef) {
        var encNodeRef = encodeURIComponent(nodeRef);
        return $http.get('/lool/token?nodeRef=' + encNodeRef + '&action=edit')
            .then(function (response) {
                return response.data;
            })
    }

    function getValidMimeTypes() {
        return $http.get('discovery')
            .then(function (response) {
                var mimeTypes = [];
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response.data,"text/xml");
                var applications = xmlDoc.children[0].children[0].children;
                for(var id in applications) {
                    if(id > -1)
                        mimeTypes.push(applications[id].getAttribute('name'));
                }
                return mimeTypes;
            })
    }

    /**
     * Currently not in use. The idea of this was to submit a (form) request to the libreoffice online service and
     * collect the return for use in the iFrame ro render the Loleaflet client.
     * @param frameSrcURL
     * @param access_token
     * @returns {*}
     */
    function getIframeSrc(frameSrcURL, access_token) {
        return $http({
            method: 'POST',
            url: frameSrcURL,
            transformRequest: transformRequestAsFormPost,
            data: {access_token: access_token},
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "x-requested-with": ''
            }
        }).then(
            function (response) {
                // How to return this for an iframe
                return response;
            },
            function (response) {
                // Error
                return response;
            }
        );
    }


}
