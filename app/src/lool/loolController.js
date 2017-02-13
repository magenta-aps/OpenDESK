'use strict';
angular
    .module('openDeskApp.lool')
    .controller('LoolController', LoolController);

/**
 * Main Controller for the LibreOffice online module module
 * @param $scope
 * @constructor
 */
function LoolController($stateParams, loolService) {
    var vm = this;

    vm.nodeRef = $stateParams.nodeRef;

    console.log('NodeRef received for editing is: ' + vm.nodeRef);

    loolService.getWopiUrl(vm.nodeRef).then(function (response) {
        var shortRef = vm.nodeRef.substring(vm.nodeRef.lastIndexOf('/')+1);
        debugger;
        var wopi_src_url = response.wopi_src_url;
        var wopiFileURL = "wopi/files/" + shortRef;
        var frameSrcURL = wopi_src_url + "WOPISrc=" + encodeURIComponent(wopiFileURL);
        var access_token = encodeURIComponent(response.access_token);
        loolService.getIframeSrc(frameSrcURL, access_token).then(function(response){
            vm.iframeSrc = response;
        });
    });

}

