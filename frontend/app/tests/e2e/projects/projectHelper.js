// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var constants = require('../common/constants');

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

        openDefaultProject: function () {
            element.all(by.repeater('project in vm.showall')).filter(function (elem) {
                //Return the element or elements
                return elem.getText().then(function (text) {
                    //Match the text
                    return text.indexOf(constants.PROJECT_DEFAULT) >= 0;
                });
            }).then(function (filteredElements) {
                expect(filteredElements.length).toBe(1);
                filteredElements[0].click();
                browser.driver.sleep(1000);
                expect(element(by.css('.od-title')).getInnerHtml()).toMatch(constants.PROJECT_DEFAULT);
            });
        },

        getProjectPageTitle: function () {
            return element(by.css('.od-title')).getInnerHtml();
        },

        backToProjects: function () {
            element(by.css(".od-back-btn")).click();
            expect(browser.getCurrentUrl()).toContain('/projekter');
            browser.driver.sleep(1000);
        }
    }
}

module.exports = ProjectHelper();