// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var folderName;
var folderList;

var CreateFolderPage = function () {

	return {
		getFolderList: function () {
			folderList = element.all(by.css('td a.od-filebrowser-link span.content-name'));
			return folderList.getInnerHtml();
		},

		getCreatedFolder: function () {
			return folderName;
		},

		openCreateFolderDialog: function () {
			return element(by.css('[aria-label="Create folder"]')).click();
		},

		fillInputFields: function (folder) {
			folderName = folder;
			var folderNameInput = element(by.model('newFolderName'));
			folderNameInput.sendKeys(folderName);
		},

		createFolder: function () {
			return element(by.css('[aria-label="New folder"] button[type="submit"]')).click();
		},

		openFolder: function () {

		}
	}
};

module.exports = CreateFolderPage();