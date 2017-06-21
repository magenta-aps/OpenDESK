var loginPage = require('../login/loginPage.po.js');
var projectHelper = require('./projectHelper.js');
var openProjectsPage = require('./openProjectPage.po.js');
var createProjectPage = require('./createProjectPage.po.js');
var renameProjectPage = require('./renameProjectPage.po.js');
var deleteProjectPage = require('./deleteProjectPage.po.js');
var constants = require('../common/constants');

describe('new project', function () {
    it('should create a new project', function () {
        createProjectPage.openCreateProjectDialog();
        createProjectPage.fillInputFields(constants.PROJECT_NAME, false);
        createProjectPage.createProject();
        expect(projectHelper.getProjectPageTitle()).toMatch(constants.PROJECT_NAME);
    });

    it('should rename the project', function () {
        renameProjectPage.showDetails();
        renameProjectPage.openEditDialog();
        renameProjectPage.editProjectName(constants.PROJECT_NAME_RENAME);
        renameProjectPage.renameProject();
        expect(projectHelper.getProjectPageTitle()).toMatch(constants.PROJECT_NAME_RENAME);
    });
});

describe('back to project list', function () {

    it('should go back to project list', function () {
        projectHelper.backToProjects();
        expect(browser.getCurrentUrl()).toContain('/#!/projekter');
    });

    it('should see project info', function () {
        projectHelper.findProjectInList(constants.PROJECT_NAME_RENAME).then(function (filteredElements) {
            expect(filteredElements.length).toBe(1);
            var menuBtn = filteredElements[0].all(by.css('md-menu button')).first();
            var infoBtn = element(by.css('.md-active [aria-label="info_outline"]'));
            var closeBtn = element(by.css('[aria-label="Information about project"] button[ng-click="vm.cancel()"]'))

            menuBtn.click();
            infoBtn.click();
            browser.driver.sleep(1000);
            closeBtn.click();
            browser.driver.sleep(1000);
        });
    });

    it('should delete the project', function () {
        projectHelper.findProjectInList(constants.PROJECT_NAME_RENAME).then(function (filteredElements) {
            expect(filteredElements.length).toBe(1);
        });

        deleteProjectPage.deleteProject(constants.PROJECT_NAME_RENAME);
        browser.driver.sleep(1000);

        projectHelper.findProjectInList(constants.PROJECT_NAME_RENAME).then(function (filteredElements) {
            expect(filteredElements.length).toBe(0);
        });
    });
});