var constants = require('../common/constants');
var documentHelper = require('../documents/documentHelper.js');

var RenameFolderPage = function () {

    return {
        renameFolder: function (folder,newName) {
            documentHelper.findDocumentInList(folder).then(function (response) {
                expect(response.length).toBe(1);

                documentHelper.openOptionMenu(response[0]);
                documentHelper.renameAction(newName);
            });
        }
    }
};

module.exports = RenameFolderPage();