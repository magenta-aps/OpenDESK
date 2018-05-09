'use strict';

angular.module('openDeskApp.onlyOffice')
    .factory('onlyOfficeService', onlyOfficeService);

function onlyOfficeService($http) {

    var restBaseUrl = '/alfresco/service';

    return {
        getDocumentType: getDocumentType,
        key: key,
        preparePreview: preparePreview
    };

    function getDocumentType (ext) {
        if (".docx.doc.odt.rtf.txt.html.htm.mht.pdf.djvu.fb2.epub.xps".indexOf(ext) != -1) return "text";
        if (".xls.xlsx.ods.csv".indexOf(ext) != -1) return "spreadsheet";
        if (".pps.ppsx.ppt.pptx.odp".indexOf(ext) != -1) return "presentation";
        return null;
    }

    function key(k) {
        var result = k.replace(new RegExp("[^0-9-.a-zA-Z_=]", "g"), "_") + (new Date()).getTime();
        return result.substring(result.length - Math.min(result.length, 20));
    }

    function preparePreview() {
        var url = restBaseUrl + "/parashift/onlyoffice/prepare?nodeRef=" + url.args.nodeRef;
        return $http.get(url, {}).then(function (response) {
            var docName = response.docTitle;
            var docType = docName.substring(docName.lastIndexOf(".") + 1).trim().toLowerCase();
            var docConfig = {
                type: "desktop",
                width: "100%",
                height: "100%",
                documentType: getDocumentType(docType),
                document: {
                    title: docName,
                    url: response.docUrl,
                    fileType: docType,
                    key: response.key,
                    permissions: {
                        edit: true
                    }
                },
                editorConfig: {
                    mode: "edit",
                    callbackUrl: response.callbackUrl,
                    user: {
                        id: response.id,
                        firstname: response.firstName,
                        lastname: response.lastName
                    }
                }
            };
            if(response.lang !== undefined)
                docConfig.lang = response.lang;
            return docConfig;
        });
    }
}