var globalHeaderMenu = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var date = new Date();
var documentRenamed = "dokument-omdøbt " + date.getTime();
var documentList;

var RenameDocumentPage = function () {

	return {
		getDocumentList: function () {
			var documentList = element.all(by.repeater('content in contents'));
			var documentNames = documentList.all(by.css('.content-name'));
			return documentNames.getInnerHtml();
		},

		getRenamedDocument: function () {
			return documentRenamed;
		},

		renameDocument: function (newName) {
			//Select all data elements and apply filter function
			element.all(by.repeater('content in contents')).filter(function (elem) {
				//Return the element or elements
				return elem.getText().then(function (text) {
					//Match the text
					return text.indexOf(constants.file_uploaded) >= 0;
				});
			}).then(function (filteredElements) {
				var documentOptionsBtn = filteredElements[0].all(by.css('[ng-click="$mdMenu.open()"]')).first();
				documentOptionsBtn.click();
				browser.driver.sleep(1000);

				var selectRenameBtn = element.all(by.css('[ng-click="vm.renameDocumentDialog($event, content)"]')).last();
				selectRenameBtn.click();

				var renameBtn = element.all(by.model('vm.newFileName'));
				renameBtn.sendKeys(newName);

				var renameBtn = element.all(by.css('[aria-label="Rename"]')).first();
				renameBtn.click();
			});
		}
	};
};

module.exports = RenameDocumentPage();