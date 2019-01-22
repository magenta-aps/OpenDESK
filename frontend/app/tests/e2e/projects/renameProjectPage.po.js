// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var RenameProjectPage = function () {

	return {

		showDetails: function () {
			element(by.css('#details')).click();
		},

		openEditDialog: function () {
			return element(by.css('[aria-label="Redigér site"]')).click();
		},

		editProjectName: function (newName) {
			var projectNameInput = element(by.model('newSite.siteName'));
			projectNameInput.clear();
			projectNameInput.sendKeys(newName);
		},

		renameProject: function () {
			var saveBtn = element(by.css('[aria-label="Edit project"] button[type="submit"]'));
			saveBtn.click();
		}
	}
};

module.exports = RenameProjectPage();
