var loginPage = require('../login/loginPage.po.js');
var projectHelper = require('./projectHelper.js');
var openProjectsPage = require('./openProjectPage.po.js');
var createProjectPage = require('./createProjectPage.po.js');
var renameProjectPage = require('./renameProjectPage.po.js');
var deleteProjectPage = require('./deleteProjectPage.po.js');
var constants = require('../common/constants');

xdescribe('new project', function () {
    it('should create a new project', function () {
        createProjectPage.openCreateProjectDialog();
        createProjectPage.fillInputFields(constants.PROJECT_NAME_1, false);
        createProjectPage.createProject();
        expect(projectHelper.getProjectPageTitle()).toMatch(constants.PROJECT_NAME_1);
    });

    it('should rename the project', function () {
        renameProjectPage.showDetails();
        renameProjectPage.openEditDialog();
        renameProjectPage.editProjectName(constants.PROJECT_NAME_RENAME_NEW_NAME);
        renameProjectPage.renameProject();
        expect(projectHelper.getProjectPageTitle()).toMatch(constants.PROJECT_NAME_RENAME_NEW_NAME);
    });
});

describe('back to project list', function () {
    xit('should go back to project list', function () {
        projectHelper.backToProjects();
        expect(browser.getCurrentUrl()).toContain('/#!/projekter');
    });

    xit('should see project info', function () {
        expect(projectHelper.getProjectList()).toContain(constants.PROJECT_NAME_RENAME_NEW_NAME);
    });

    it('should delete the project', function () {
        expect(projectHelper.getProjectList.getText()).toContain(constants.PROJECT_NAME_RENAME_NEW_NAME);
        //expect(projectHelper.isInProjectList(constants.PROJECT_NAME_RENAME_NEW_NAME)).toBe(true);
        //deleteProjectPage.deleteProject(constants.PROJECT_NAME_RENAME_NEW_NAME);
        browser.driver.sleep(1000);
        //expect(projectHelper.getProjectList(constants.PROJECT_NAME_RENAME_NEW_NAME)).toBeFalsy();
    });
});
