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
    loolService.getWopiUrl(vm.nodeRef).then(function (response) {

        var shortRef = vm.nodeRef.substring(vm.nodeRef.lastIndexOf('/') + 1);
        var wopi_src_url = response.wopi_src_url;
        var wopiFileURL = "wopi/files/" + shortRef;
        var frameSrcURL = wopi_src_url + "WOPISrc=" + encodeURIComponent(wopiFileURL);
        var access_token = encodeURIComponent(response.access_token);
        //Use JQuery to submit the form and 'target' the iFrame
        $(function () {
            var form = '<form id="loleafletform" name="loleafletform" target="loleafletframe" action="' +frameSrcURL + '" method="post">' +
                '<input name="access_token" value="' + encodeURIComponent(access_token) + '" type="hidden"/></form>';

            $('#libreoffice-online').append(form);
            $('#loleafletform').submit();
        });
    });

}