var constants = require('../common/constants');
var documentHelper = require('./documentHelper.js');

var PreviewDocumentPage = function () {
    
    return {
		previewDocument: function (fileName) {
            documentHelper.findDocumentInList(fileName).then(function (response) {
                expect(response.length).toBe(1);
                documentHelper.openOptionMenu(response[0]);
				browser.driver.sleep(500);
                documentHelper.previewAction();
            });
        },

		getPreviewDocumentTitle: function() {
			return element(by.css('[aria-label="Preview document"] h2')).getText();
		}
	}
};

module.exports = PreviewDocumentPage();