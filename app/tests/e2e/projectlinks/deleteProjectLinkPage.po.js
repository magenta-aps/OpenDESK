var constants = require('../common/constants');
var documentHelper = require('../documents/documentHelper.js');

var DeleteProjectLinkPage = function () {

    return {
        deleteProjectLink: function (projectlink) {
            documentHelper.findDocumentInList(projectlink).then(function (response) {
                expect(response.length).toBe(1);

                documentHelper.openOptionMenu(response[0]);

                var deleteOptionBtn = element.all(by.css('[ng-click="vm.deleteFileDialog($event, content)"]')).last();
                deleteOptionBtn.click();

                var deleteBtn = element.all(by.css('[aria-label="Remove"]')).first();
                deleteBtn.click();
            });
        }
    }
};

module.exports = DeleteProjectLinkPage();