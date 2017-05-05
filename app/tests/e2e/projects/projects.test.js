var globalHeader = require('../common/globalHeader.po.js');
var loginPage = require('../login/loginPage.po.js');
var openProjectsPage = require('./openProjectsPage.po.js');
var createProjectPage = require('./createProjectsPage.po.js');
//var deleteProjectPage = require('./deleteProjectPage.po.js');
//var renameProjectPage = require('./renameProjectPage.po.js');
var constants = require('../common/constants');


describe('openDESK search document', function() {

    it('login', function() {

        loginPage.loginAsAdmin();

    });
});


describe('openDESK create project', function() {


    it('should be able to create a new project', function() {
    	openProjectsPage.openProjects().then (function (response) {
            createProjectPage.createProject(constants.PROJECT_NAME_create_delete);
            console.log("heyyyyyy");
        })



        //the created project is represented in the project list
        expect(createProjectPage.getProjectList().getText()).toMatch(createProjectPage.getCreatedProject());
    });
});

//
//describe('openDESK delete project', function() {
//
//    browser.driver.sleep(5000);
//
//    it('should be able to delete an existing project', function() {
//
//
//        return browser.get("http://localhost:8000/#/projekter").then (function(response) {
//
//            deleteProjectPage.deleteProject(constants.PROJECT_NAME_create_delete);
//
//            expect(deleteProjectPage.getProjectList().getText()).not.toMatch(constants.PROJECT_NAME_create_delete);
//        });
//
//    });
//});


//
//describe('openDESK rename project', function() {
//
//    it('should be able to rename an existing project', function() {
//
//        return browser.get("http://localhost:8000/#/projekter").then (function(response) {
//
//            //New project need to be created, because project may just have been deleted
//            renameProjectPage.renameProject();
//
//            //the renamed project is represented in the project list
//            expect(renameProjectPage.getProjectList().getText()).toMatch(constants.PROJECT_NAME_RENAME_NEW_NAME);
//
//        });
//    });
//});
