var globalHeaderMenu = require('../common/globalHeader.po.js');
var deletedProjectName;
var projectList;
var constants = require('../common/constants');

var BreakException = {};


var DeleteProjectPage = function () {

    var public = {};

    public.getProjectList = function () {
        projectList = element.all(by.repeater('project in vm.sites'));
        return projectList;
    }

    public.getDeletedProject = function () {
        return deletedProjectName;
    }

    public.deleteProject = function (titleText) {
        
        var projectRow = element(by.css('#' + titleText));
        var menuBtn = element(by.css('#' + titleText + ' md-menu button'));
        var deleteBtn = element(by.css('.md-active [aria-label="remove"]'));
        var deleteConfirmBtn = element(by.css('[aria-label="Slet projekt"] button[aria-label="remove"]'))

        menuBtn.click();
        deleteBtn.click();
        deleteConfirmBtn.click();

        browser.driver.sleep(2000);
    };

    return public;
};

module.exports = DeleteProjectPage();