// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

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