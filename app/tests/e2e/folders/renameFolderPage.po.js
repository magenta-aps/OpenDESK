var constants = require('../common/constants');
var documentHelper = require('../documents/documentHelper.js');

var RenameFolderPage = function () {

    return {
        renameFolder: function (folder,newName) {
            documentHelper.findDocumentInList(folder).then(function (response) {
                expect(response.length).toBe(1);

                var documentOptionsBtn = response[0].all(by.css('[ng-click="$mdMenu.open()"]')).first();
                documentOptionsBtn.click();
                browser.driver.sleep(1000);

                var renameOptionBtn = element.all(by.css('[ng-click="vm.renameDocumentDialog($event, content)"]')).last();
                renameOptionBtn.click();

                var renameInput = element(by.model('vm.newFileName'));
                renameInput.sendKeys(newName);

                var renameBtn = element.all(by.css('[aria-label="Rename"]')).first();
                renameBtn.click();
            });
        }
    }
};

module.exports = RenameFolderPage();