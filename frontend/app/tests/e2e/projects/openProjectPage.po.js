// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var globalHeaderMenu = require('../common/globalHeader.po.js');


var OpenProjectPage = function () {

    return {
        openProjects: function () {
            var goToProjectBtn = element(by.css('a[href^="projekter"]'));
            return goToProjectBtn.click();
        },

        openProject: function (projectName) {
			//Select all data elements and apply filter function
			element.all(by.repeater('project in vm.showall')).filter(function (elem) {
				//Return the element or elements
				return elem.getText().then(function (text) {
					//Match the text
					return text.indexOf(projectName) >= 0;
				});
			}).then(function (filteredElements) {
                var projectList = filteredElements[0].all(by.css('.od-filebrowser-link')).first();
                projectList.click();
			});
		}
    };
};

module.exports = OpenProjectPage();