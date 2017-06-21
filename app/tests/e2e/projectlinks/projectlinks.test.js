var constants = require('../common/constants');
var projectHelper = require('../projects/projectHelper.js');
var documentHelper = require('../documents/documentHelper.js');
var createProjectLinkPage = require('./createProjectLinkPage.po.js');
var deleteProjectLinkPage = require('./deleteProjectLinkPage.po.js');

describe('OpenDesk project links', function () {

    it('should go to default project', function () {
        projectHelper.findProjectInList(constants.PROJECT_DEFAULT).then(function (response) {
            expect(response.length).toBe(1);
            response[0].click();
            browser.driver.sleep(1000);
            expect(projectHelper.getProjectPageTitle()).toMatch(constants.PROJECT_DEFAULT);
        });
    });

    it('should create a new project link', function () {
        createProjectLinkPage.openCreateProjectlinkDialog();
        createProjectLinkPage.fillInputFields(constants.PROJECTLINK_SEARCH);
        createProjectLinkPage.createProjectlink();
        documentHelper.findDocumentInList(constants.PROJECTLINK).then(function (response) {
            expect(response.length).toBe(1);
        });
    });

    it('should delete project link', function() {
        deleteProjectLinkPage.deleteProjectLink(constants.PROJECTLINK);

        documentHelper.findDocumentInList(constants.PROJECTLINK).then(function (response) {
            expect(response.length).toBe(0);
        });
    });
});