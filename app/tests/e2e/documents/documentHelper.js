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
        }
    }
}

module.exports = DocumentHelper();