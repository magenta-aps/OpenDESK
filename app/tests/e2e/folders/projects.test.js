var globalHeader = require('../common/globalHeader.po.js');
var createFolderPage = require('./createFolderPage.po.js');
var deleteFolderPage = require('./deleteFolderPage.po.js');
var constants = require('../common/constants');
var loginPage = require('../login/loginPage.po.js');

describe('openDESK create folder', function() {




    //it('login', function() {
    //
    //    //loginPage.loginAsAdmin();
    //
    //});


    it('should be able to create a new folder', function() {

        browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {

            createFolderPage.createFolder();

            //the created folder is represented in the list
            expect(createFolderPage.getFolderList().getText()).toMatch(constants.folder_to_be_created_and_deleted);
        });
    });


    it('should be able to delete a new folder', function() {

        browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {
            deleteFolderPage.deleteFolder();

            //the deleted folder is not represented in the list
            expect(deleteFolderPage.getFolderList().getText()).not.toMatch(constants.folder_to_be_created_and_deleted);
        });
    });



});


