var globalHeader = require('../common/globalHeader.po.js');
var loginPage = require('../login/loginPage.po.js');
var openProjectsPage = require('./openProjectsPage.po.js');
var createProjectPage = require('./createProjectsPage.po.js');
var deleteProjectPage = require('./deleteProjectPage.po.js');
//var renameProjectPage = require('./renameProjectPage.po.js');
var constants = require('../common/constants');


describe('openDESK login', function() {
    it('should login', function() {
        loginPage.loginAsAdmin();
    });
});

describe('public projects', function() {
    it('should be able to be created', function() {
        createProjectPage.openCreateProjectDialog();
        createProjectPage.fillInputFields(constants.PROJECT_NAME_1,false);
        createProjectPage.createProject();
        expect(createProjectPage.getProjectPageTitle().getInnerHtml()).toContain(constants.PROJECT_NAME_1);
    });

    it('should be able to be deleted', function() {
        return browser.get("http://localhost:8000/#!/projekter").then (function(response) {
            deleteProjectPage.deleteProject(constants.PROJECT_NAME_1);
        });
    });
});

xdescribe('projects list',function () {
    it('should be able to open a project', function() {

    });
});

describe('openDESK logout', function() {
    it('should logout', function() {
        loginPage.logout();
    });
});



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
