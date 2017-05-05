var loginPage = require('../login/loginPage.po.js');
var globalHeader = require('../common/globalHeader.po.js');
var searchDocumentPage = require('./searchDocumentPage.po.js');
var constants = require('../common/constants');
var previewDocumentPage = require('./previewDocumentPage.po.js');
var deleteDocumentPage = require('./deleteDocumentPage.po.js');
var renameDocumentPage = require('./renameDocumentPage.po.js');
var copyDocumentPage = require('./copyDocumentPage.po.js');
var relocateDocumentPage = require('./relocateDocumentPage.po.js');


//Executed before each of the "it" tests
beforeEach(function () {

});


//describe('openDESK search document', function() {
//
//    it('should be able to search and find an existing document', function() {
//
//        loginPage.loginAsAdmin();
//
//    });
//});


describe('openDESK search document', function() {

    it('should be able to search and find an existing document', function() {
        searchDocumentPage.searchDocument().then (function(response) {
            expect(response === constants.file_1.name).toBe(true, "expected the result to be: " + constants.file_1.name + "instead it was: " + response);
        });
    });
});


describe('openDESK preview document', function() {

    it('should be able to search and preview an existing document', function() {


        return browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_2 ).then (function(response) {
            previewDocumentPage.previewDocument();

            //the created folder is represented in the list
            expect(previewDocumentPage.getPreviewHeadline()).toContain(constants.file_2.name);
            previewDocumentPage.closeDialog();
        });



    });
});


describe('openDESK rename document', function() {

    it('should be able to rename an existing document', function() {
    	renameDocumentPage.renameDocument();

        //the created folder is represented in the list
        expect(renameDocumentPage.getDocumentList()).toMatch(renameDocumentPage.getRenamedDocument());
    });
});


// todo need to be refactored to use a project we create and destroy for each test session - as the default project is not repopulated

//describe('openDESK relocate a document', function() {
//
//    it('should be able to relocate an existing document to another location', function() {
//
//        return browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_USED_FOR_MOVE ).then (function(response) {
//
//
//            relocateDocumentPage.relocateDocument();
//
//            //after relocating, check that document is no longer at its original place
//            expect(relocateDocumentPage.getDocumentOriginList()).not.toMatch(relocateDocumentPage.getDocumentRelocated());
//
//            browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_USED_FOR_MOVE_AFTER_MOVE ).then (function(response) {
//                //the copied folder is represented at the selected position/list
//                expect(relocateDocumentPage.getDocumentList()).toMatch(relocateDocumentPage.getDocumentRelocated());
//            });
//
//
//
//        });
//
//
//
//    });
//});


describe('openDESK copy document', function() {
    it('should be able to copy an existing document to another location', function() {

        return browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_2 ).then (function(response) {
            copyDocumentPage.copyDocument();

            browser.sleep(2500);
            //the copied file is represented in the list
            expect(copyDocumentPage.getDocumentList()).toMatch("Copy of " + constants.file_1.name);
        });
    });
});



describe('openDESK delete document', function() {

    it('should be able to delete an existing document', function() {


        return browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_2 ).then (function(response) {
            deleteDocumentPage.deleteDocument();

           //the created folder is represented not in the list
            expect(deleteDocumentPage.getDocumentList()).not.toMatch(constants.file_3.name);




        });
    });
});