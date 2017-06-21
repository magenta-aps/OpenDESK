var constants = require('../common/constants');
var documentHelper = require('../documents/documentHelper.js');

var DeleteFolderPage = function () {

    return {
        deleteFolder: function (folder) {
            documentHelper.findDocumentInList(folder).then(function (response) {
                expect(response.length).toBe(1);

                var documentOptionsBtn = response[0].all(by.css('[ng-click="$mdMenu.open()"]')).first();
                documentOptionsBtn.click();
                browser.driver.sleep(1000);

                var deleteOptionBtn = element.all(by.css('[ng-click="vm.deleteFileDialog($event, content)"]')).last();
                deleteOptionBtn.click();

                var deleteBtn = element.all(by.css('[aria-label="Remove"]')).first();
                deleteBtn.click();
            });
        }
    }
};

module.exports = DeleteFolderPage();