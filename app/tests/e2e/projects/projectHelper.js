var ProjectHelper = function () {

    return {
        findProjectInList: function (projectName) {
            return element.all(by.repeater('project in vm.showall')).filter(function (elem) {
                //Return the element or elements
                return elem.getText().then(function (text) {
                    //Match the text
                    return text.indexOf(projectName) >= 0;
                });
            })
        },

        getProjectPageTitle: function () {
            return element(by.css('.od-title')).getInnerHtml();
        },

        backToProjects: function () {
            element(by.css(".od-back-btn")).click();
            expect(browser.getCurrentUrl()).toContain('/#!/projekter');
        }
    }
}

module.exports = ProjectHelper();