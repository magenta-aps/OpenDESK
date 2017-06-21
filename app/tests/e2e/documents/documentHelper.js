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

        openOptionMenu: function(document) {
            document.all(by.css('[ng-click="$mdMenu.open()"]')).first().click();
            browser.driver.sleep(1000);
        }
    }
}

module.exports = DocumentHelper();