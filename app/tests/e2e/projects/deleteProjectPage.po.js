var DeleteProjectPage = function () {

    return {

        deleteProject: function (projectName) {
            element.all(by.repeater('project in vm.showall')).filter(function (elem) {
                //Return the element or elements
                return elem.getText().then(function (text) {
                    //Match the text
                    return text.indexOf(projectName) >= 0;
                });
            }).then(function (filteredElements) {
                var menuBtn = filteredElements[0].all(by.css('md-menu button')).first();
                var deleteBtn = element(by.css('.md-active [aria-label="remove"]'));
                var deleteConfirmBtn = element(by.css('[aria-label="Slet projekt"] button[aria-label="remove"]'))

                menuBtn.click();
                deleteBtn.click();
                deleteConfirmBtn.click();
                browser.driver.sleep(1000);
            });
        }
    };
};

module.exports = DeleteProjectPage();