var deletedProjectName;
var projectList;

var DeleteProjectPage = function () {

    return {
        backToProjects: function () {
            element(by.css(".od-back-btn")).click();
            expect(browser.getCurrentUrl()).toContain('/#!/projekter');
        },

        getProjectList: function () {
            projectList = element.all(by.css('td a.od-filebrowser-link h3'));
            return projectList.getInnerHtml();
        },

        // public.getProjectList = function () {
        //     projectList = element.all(by.repeater('project in vm.sites'));
        //     return projectList;
        // }

        getDeletedProject: function () {
            return deletedProjectName;
        },

        deleteProject: function (titleText) {
            var projectRow = element(by.css('#' + titleText));
            var menuBtn = element(by.css('#' + titleText + ' md-menu button'));
            var deleteBtn = element(by.css('.md-active [aria-label="remove"]'));
            var deleteConfirmBtn = element(by.css('[aria-label="Slet projekt"] button[aria-label="remove"]'))

            menuBtn.click();
            deleteBtn.click();
            deleteConfirmBtn.click();

            browser.driver.sleep(2000);
        }
    };
};

module.exports = DeleteProjectPage();