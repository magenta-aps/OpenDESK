var constants = require('../common/constants');
var documentHelper = require('./documentHelper.js');

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
            documentHelper.findDocumentInList(fileName).then(function (response) {
                expect(response.length).toBe(1);
                documentHelper.openOptionMenu(response[0]);
                documentHelper.deleteAction();
            });
        }
	};
};

module.exports = DeleteDocumentPage();