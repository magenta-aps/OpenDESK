var constants = require('../common/constants');

var DeleteDocumentPage = function () {

	return {
		getDocumentList: function () {
			var documentList = element.all(by.repeater('content in contentTypeList'));
			var documentNames = documentList.all(by.css('.content-name'));
			return documentNames.getInnerHtml();
		},

		getDeletedDocumentName: function () {
			return constants.file_4;
		},

		deleteDocument: function (fileName) {
			//Select all data elements and apply filter function
			element.all(by.repeater('content in contentTypeList')).filter(function (elem) {
				//Return the element or elements
				return elem.getText().then(function (text) {
					//Match the text
					return text.indexOf(fileName) >= 0;
				});
			}).then(function (filteredElements) {
				var documentOptionsBtn = filteredElements[0].all(by.css('[ng-click="$mdMenu.open()"]')).first();

				documentOptionsBtn.click();
				browser.driver.sleep(3000);

				var selectDeleteBtn = element.all(by.css('[ng-click="vm.deleteFileDialog($event, content)"]')).last();
				selectDeleteBtn.click();

				var deleteBtn = element.all(by.css('[aria-label="Remove"]')).first();
				deleteBtn.click();
			});
		}
	};
};

module.exports = DeleteDocumentPage();