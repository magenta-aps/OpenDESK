var DocumentHelper = function () {

    return {
        findDocumentInList: function (documentName) {
            return element.all(by.repeater('content in contentTypeList')).filter(function (elem) {
                //Return the element or elements
                return elem.getText().then(function (text) {
                    //Match the text
                    return text.indexOf(documentName) >= 0;
                });
            })
        },

        openOptionMenu: function (document) {
            document.all(by.css('[ng-click="$mdMenu.open()"]')).first().click();
            browser.driver.sleep(1000);
        },

        deleteAction: function () {
            var deleteOptionBtn = element.all(by.css('[ng-click="vm.deleteFileDialog($event, content)"]')).last();
            deleteOptionBtn.click();

            var deleteBtn = element.all(by.css('[aria-label="Remove"]')).first();
            deleteBtn.click();
        },

        renameAction: function (newName) {
            var renameOptionBtn = element.all(by.css('[ng-click="vm.renameDocumentDialog($event, content)"]')).last();
            renameOptionBtn.click();

            var renameInput = element(by.model('vm.newFileName'));
            renameInput.sendKeys(newName);

            var renameBtn = element.all(by.css('[aria-label="Rename"]')).first();
            renameBtn.click();
        }
    }
}

module.exports = DocumentHelper();