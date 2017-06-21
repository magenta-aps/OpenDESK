var constants = require('../common/constants');
var projectHelper = require('../projects/projectHelper.js');
var documentHelper = require('./documentHelper.js');
var uploadDocumentPage = require('./uploadDocumentPage.po.js');
var deleteDocumentPage = require('./deleteDocumentPage.po.js');
var renameDocumentPage = require('./renameDocumentPage.po.js');
var previewDocumentPage = require('./previewDocumentPage.po.js');

describe('OpenDesk documents', function () {

    it('should go to default project', function () {
        projectHelper.openDefaultProject();
    });

    it('should upload a new document', function () {
        uploadDocumentPage.openUploadDocumentDialog();
        uploadDocumentPage.fillInputFields(constants.FILE_UPLOAD_URL);
        uploadDocumentPage.uploadDocument();
        browser.driver.sleep(1000);
        documentHelper.findDocumentInList(constants.FILE_UPLOAD).then(function (response) {
            expect(response.length).toBe(1);
        });
    });

    it('should rename the document', function () {
        renameDocumentPage.renameDocument(constants.FILE_UPLOAD,constants.FILE_UPLOAD_RENAME);
        documentHelper.findDocumentInList(constants.FILE_UPLOAD_RENAME).then(function (response) {
            expect(response.length).toBe(1);
        });
    });

    it('should preview the document', function () {
        previewDocumentPage.previewDocument(constants.FILE_UPLOAD_RENAME);
        //expect(previewDocumentPage.getPreviewDocumentTitle()).toContain(constants.FILE_UPLOAD_RENAME);
    });

    it('should delete the document', function () {
        deleteDocumentPage.deleteDocument(constants.FILE_UPLOAD_RENAME);

        documentHelper.findDocumentInList(constants.FILE_UPLOAD_RENAME).then(function (response) {
            expect(response.length).toBe(0);
        });
    });

    it('should go back to project list', function () {
        projectHelper.backToProjects();
    });
});