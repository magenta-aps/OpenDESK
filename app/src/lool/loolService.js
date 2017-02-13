angular
    .module('openDeskApp.lool')
    .factory('loolService', loolService);


function loolService($http) {

    return {
        getWopiUrl: getWopiUrl,
        getIframeSrc: getIframeSrc,
        getLoolServiceUrl: getLoolServiceUrl
    };

    //Just in case this is set. Call the server and see if the service url is set get around proxy issues
    function getLoolServiceUrl(){
        return $http.get('/lool/host/url').then(function(response){
            return response.data.lool_host_url;
        })

    }

    function getWopiUrl(nodeRef){
        var encNodeRef = encodeURIComponent(nodeRef);
        return $http.get('/lool/token?nodeRef='+encNodeRef+'&action=edit')
            .then(function(response){
                console.log(response.data.access_token, response.data.wopi_src_url);
                return response.data;
            })
    }

    function getIframeSrc(frameSrcURL, access_token){
        $http.post(frameSrcURL,{access_token: access_token}).then(function(response){
            return response.data;
        })
    }

}
