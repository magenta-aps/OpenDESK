'use strict';

angular.module('openDeskApp.onlyOffice')
    .factory('onlyOfficeService', onlyOfficeService);

function onlyOfficeService($http) {

    var restBaseUrl = '/alfresco/service';

    return {
        getDocumentType: getDocumentType,
        key: key,
        displayEdit: displayEdit,
        displayPreview: displayPreview
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

    function displayEdit(nodeRef) {
        return display(nodeRef, "edit").then(function(response) {
            return response;
        })
    }

    function displayPreview(nodeRef) {
        return display(nodeRef, "view").then(function(response) {
            return response;
        })
    }

    function display(nodeRef, mode) {
        return prepare(nodeRef, mode).then(
            function (response) {
                new DocsAPI.DocEditor("placeholder", response);
                //Keep Alfresco active
                setInterval(function () {
                    $http.get(restBaseUrl + "/touch");
                }, 60000);
                return true;
            },
            function (error) {
                return false;
            })
    }

    function prepare(nodeRef, mode) {
        var url = restBaseUrl + "/parashift/onlyoffice/prepare?nodeRef=workspace://SpacesStore/" + nodeRef;
        var height = "100%";
        if(mode === "view")
            height = "600px";
        return $http.get(url, {}).then(function (response) {
            response = response.data;
            var docName = response.docTitle;
            var docType = docName.substring(docName.lastIndexOf(".") + 1).trim().toLowerCase();
            var docConfig = {
                url: response.onlyofficeUrl + "OfficeWeb/",
                type: "desktop",
                width: "100%",
                height: height,
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
                    mode: mode,
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