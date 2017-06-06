var globalHeader = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var loginPage = require('../login/loginPage.po.js');
var logoutPage = require('../login/logoutPage.po.js');
var createProjectPage = require('../projects/createProjectsPage.po.js');
var renameProjectPage = require('../projects/renameProjectPage.po.js');
var deleteProjectPage = require('../projects/deleteProjectPage.po.js');
var addMemberPage = require('../members/addMemberPage.po.js');

var createFolderPage = require('../folders/createFolderPage.po.js');
var createProjectlinkPage = require('../projectlinks/createProjectlinkPage.po.js');

describe('User Henrik', function() {

    it('should login as admin', function() {
        loginPage.loginAsAdmin();
    });

    it('should create a new project', function() {
        createProjectPage.openCreateProjectDialog();
        createProjectPage.fillInputFields(constants.PROJECT_NAME_1,false);
        createProjectPage.createProject();
        expect(createProjectPage.getProjectPageTitle().getInnerHtml()).toContain(constants.PROJECT_NAME_1);
    });

    xit('should rename the project', function() {
        renameProjectPage.showDetails();
        renameProjectPage.openEditDialog();
        renameProjectPage.editProjectName(constants.PROJECT_NAME_RENAME_NEW_NAME);
        renameProjectPage.renameProject();
        expect(createProjectPage.getProjectPageTitle().getInnerHtml()).toMatch(constants.PROJECT_NAME_RENAME_NEW_NAME);
    });

    xit('should add a new member', function() {
        addMemberPage.openAddMemberDialog();
        addMemberPage.addMember();
    });

    it('should make a new folder', function() {
        createFolderPage.openCreateFolderDialog();
        createFolderPage.fillInputFields();
        createFolderPage.createFolder();

        expect(createFolderPage.getFolderList()).toContain(createFolderPage.getCreatedFolder());
    });

    xit('should make a new projectlink', function() {
        createProjectlinkPage.openCreateProjectlinkDialog();
        createProjectlinkPage.fillInputFields();
        createProjectlinkPage.createProjectlink();
    });

    it('should delete the project', function() {
        deleteProjectPage.backToProjects();

    });

    xit('should logout', function() {
        logoutPage.logout();
    });
});