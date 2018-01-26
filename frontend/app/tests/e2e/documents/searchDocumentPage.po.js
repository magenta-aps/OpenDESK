var globalHeaderMenu = require('../common/globalHeader.po.js');
var constants = require('../common/constants');

var date = new Date();
var searchedDocument = constants.file_1.name;
var breadcrumb = "";

var SearchDocumentPage = function () {
    
    var public = {};

	public.getBreadcrumb = function() {
		//last element in breadcrumb must represent the searched/selected document
		return breadcrumb;
	}
    
    public.getSearchedDocument = function() {
    	return searchedDocument;
    }

    public.searchDocument = function() {

		return browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {

			var searchDocumentInput = element(by.model('$mdAutocompleteCtrl.scope.searchText'));
			var selectedDocument = element.all(by.css('[ng-click="vm.gotoPath(r.nodeRef);"]')).first();

			searchDocumentInput.sendKeys(constants.file_1.name);
			selectedDocument.click();

			return element.all(by.repeater('path in bcPath')).then (function (response) {

				var last_element = response[response.length -1];
					return last_element.getText();
			});
		});
    };
    
    return public;
};

module.exports = SearchDocumentPage();
