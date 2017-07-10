var constants = require('../common/constants');
var documentHelper = require('../documents/documentHelper.js');

var DeleteProjectLinkPage = function () {

    return {
        deleteProjectLink: function (projectlink) {
            documentHelper.findDocumentInList(projectlink).then(function (response) {
                expect(response.length).toBe(1);

                documentHelper.openOptionMenu(response[0]);
                documentHelper.deleteAction()
            });
        }
    }
};

module.exports = DeleteProjectLinkPage();