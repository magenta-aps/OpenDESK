var constants = require('../common/constants');
var documentHelper = require('./documentHelper.js');

var RenameDocumentPage = function () {

	return {

		renameDocument: function (document,newName) {
            documentHelper.findDocumentInList(document).then(function (response) {
                expect(response.length).toBe(1);

                documentHelper.openOptionMenu(response[0]);
				documentHelper.renameAction(newName);
            });
        }
	};
};

module.exports = RenameDocumentPage();