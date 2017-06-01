var globalHeader = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var loginPage = require('../login/loginPage.po.js');
var createProjectPage = require('../projects/createProjectsPage.po.js');

var createFolderPage = require('../folders/createFolderPage.po.js');

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

    it('should make a new folder', function() {
        createFolderPage.openCreateFolderDialog();
    });

    it('should logout', function() {
        loginPage.logout();
    });
});