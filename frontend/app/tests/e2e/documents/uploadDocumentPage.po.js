var constants = require('../common/constants');

var UploadDocumentPage = function () {
    
    return {
        getDocumentList: function() {
            var documentList = element.all(by.css('td a.od-filebrowser-link span.content-name'));
			return documentList.getInnerHtml();
        },

        getDocumentName: function() {
            return constants.file_uploaded;
        },

        openUploadDocumentDialog: function () {
            var uploadDocsBtn = element(by.css('[aria-label="Upload documents"]'));
            var uploadDialogBtn = element(by.css('[aria-label="Upload local document"]'));
            uploadDocsBtn.click();
            uploadDialogBtn.click();
        },

        fillInputFields: function (fileUrl) {
            var uploadBtn = element(by.id('upload'));
            uploadBtn.sendKeys(fileUrl);
            browser.driver.sleep('3000');
        },

        uploadDocument: function () {
            return element(by.css('[aria-label="upload-files"] button[type="submit"]')).click();
        }
    };
};

module.exports = UploadDocumentPage();