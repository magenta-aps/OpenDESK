'use strict';
angular
    .module('openDeskApp.lool')
    .controller('LoolController', LoolController);

/**
 * Main Controller for the LibreOffice online module module
 */
function LoolController($stateParams, loolService, documentService, $mdToast, $translate, nodeRefUtilsService) {
    var vm = this;

    if($stateParams.nodeRef === null)
    {
        $mdToast.show(
            $mdToast.simple()
                .textContent($translate.instant('ERROR.ERROR') + ": " +
                    $translate.instant('DOCUMENT.ERROR.MISSING_NODEREF'))
                .theme('error-toast')
                .hideDelay(3000)
        );
    }
    else {
        vm.nodeRef = $stateParams.nodeRef;
        vm.nodeId = nodeRefUtilsService.getId($stateParams.nodeRef);
        documentService.getDocument(vm.nodeId).then(function (document) {

            vm.doc = document.item;
            loolService.getLoolServiceUrl().then(function (response) {
                if (response.charAt(response.length - 1) === '/')
                    response = response.substring(0, response.length - 1);
                renderIframe(response);
            });
        });
    }

    vm.goBack = function () {




        if ($stateParams.versionLabel != null && $stateParams.parent != null) {
            console.log($stateParams.parent);
            console.log($stateParams.versionLabel);

            var sp = $stateParams.versionLabel.split(".");
            var bump = (parseInt(sp[1]) + 1);
            var newVersion = sp[0] + "." + bump;
            alert("deleting version " + newVersion);


            documentService.deleteVersion($stateParams.parent, newVersion).then(function (response) {
                window.history.go(-1);
            })








        }
        else {
            window.history.go(-1);
        }



    };

    function renderIframe(serviceUrl) {
        loolService.getWopiUrl(vm.nodeRef).then(function (response) {
            var shortRef = vm.nodeRef.substring(vm.nodeRef.lastIndexOf('/') + 1);
            var wopi_src_url = response.wopi_src_url;
            var wopiFileURL = serviceUrl + "/wopi/files/" + shortRef;
            var frameSrcURL = wopi_src_url + "WOPISrc=" + encodeURIComponent(wopiFileURL);
            var access_token = encodeURIComponent(response.access_token);
            //Use JQuery to submit the form and 'target' the iFrame
            $(function () {
                var form = '<form id="loleafletform" name="loleafletform" target="loleafletframe" action="' + frameSrcURL + '" method="post">' +
                    '<input name="access_token" value="' + encodeURIComponent(access_token) + '" type="hidden"/></form>';

                $('#libreoffice-online').append(form);
                $('#loleafletform').submit();
            });
        });
    }
}