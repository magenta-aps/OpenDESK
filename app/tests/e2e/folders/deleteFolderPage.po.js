var constants = require('../common/constants');
var documentHelper = require('../documents/documentHelper.js');

var DeleteFolderPage = function () {

    return {
        deleteFolder: function (folder) {
            documentHelper.findDocumentInList(folder).then(function (response) {
                expect(response.length).toBe(1);

                documentHelper.openOptionMenu(response[0]);
                documentHelper.deleteAction();
            });
        }
    }
};

module.exports = DeleteFolderPage();