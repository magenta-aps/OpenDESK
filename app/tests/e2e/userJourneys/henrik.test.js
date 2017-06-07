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

var createDiscussionPage = require('../discussions/createDiscussionPage.po.js');

describe('User Henrik', function () {

    it('should login as admin', function () {
        loginPage.loginAsAdmin();
        expect(browser.getCurrentUrl()).toContain('/#!/projekter');
    });

    describe('should create a new project', function () {
        it('should create a new project', function () {
            createProjectPage.openCreateProjectDialog();
            createProjectPage.fillInputFields(constants.PROJECT_NAME_1, false);
            createProjectPage.createProject();
            expect(createProjectPage.getProjectPageTitle().getInnerHtml()).toContain(constants.PROJECT_NAME_1);
        });

        it('should rename the project', function () {
            renameProjectPage.showDetails();
            renameProjectPage.openEditDialog();
            renameProjectPage.editProjectName(constants.PROJECT_NAME_RENAME_NEW_NAME);
            renameProjectPage.renameProject();
            expect(createProjectPage.getProjectPageTitle().getInnerHtml()).toMatch(constants.PROJECT_NAME_RENAME_NEW_NAME);
        });
    });


    xit('should add a new member', function () {
        addMemberPage.openAddMemberDialog();
        addMemberPage.addMember();
    });

    describe('should create a new folder', function () {
        it('should create a new folder', function () {
            createFolderPage.openCreateFolderDialog();
            createFolderPage.fillInputFields(constants.folder_to_be_created_an_manipulated);
            createFolderPage.createFolder();
            expect(createFolderPage.getFolderList()).toContain(createFolderPage.getCreatedFolder());
        });

        xit('should open the folder', function () {

        });
    });

    xit('should make a new projectlink', function () {
        createProjectlinkPage.openCreateProjectlinkDialog();
        createProjectlinkPage.fillInputFields();
        createProjectlinkPage.createProjectlink();
    });

    describe('should create a new discussion', function () {
        it('should go to discussions tab', function () {
            createDiscussionPage.gotoDiscussions();
            expect(browser.getCurrentUrl()).toContain('diskussioner');
        });

        it('should create a new discussion', function () {
            createDiscussionPage.openCreateDiscussionDialog();
            createDiscussionPage.fillInputFields(constants.DISCUSSION_NAME);
            createDiscussionPage.createDiscussion();
            expect(createDiscussionPage.getDiscussionList()).toContain(constants.DISCUSSION_NAME);
        });

        xit('should open the discussion', function() {
            createDiscussionPage.openDiscussion();
            expect(createDiscussionPage.getDiscussionThreadTitle()).toBe(constants.DISCUSSION_NAME);
        });
    });

    it('should delete the project', function () {
        deleteProjectPage.backToProjects();
        deleteProjectPage.deleteProject(constants.PROJECT_NAME_1);
        browser.driver.sleep(1000);
        expect(deleteProjectPage.getProjectList()).not.toContain(constants.PROJECT_NAME_RENAME_NEW_NAME);
    });

    xit('should logout', function () {
        logoutPage.logout();
    });
});