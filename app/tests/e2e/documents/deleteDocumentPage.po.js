var globalHeaderMenu = require('../common/globalHeader.po.js');
var date = new Date();
var deletedDocumentName = "";
var documentList = "";
var constants = require('../common/constants');

var BreakException = {};

var DeleteDocumentPage = function () {
    
    var public = {};
    
    console.log("delete document");
    
	public.getDocumentList = function() {
		documentList = element.all(by.repeater('content in contents')).getText();
	    return documentList	
	}
    
    public.getDeletedDocumentName = function() {
    	return deletedDocumentName;
    }


	public.deleteDocument = function() {



		'use strict';
		//Select all date elements and apply filter function
		element.all(by.repeater('content in contents')).filter(function (elem) {
			//Return the element or elements
			return elem.getText().then(function (text) {
				//Match the text
				return text.indexOf(constants.file_3.name) >= 0;
			});
		}).then(function (filteredElements) {

			browser.driver.sleep(5000);

			var documentOptionsBtn = filteredElements[0].all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).first();

			documentOptionsBtn.click();
			browser.driver.sleep(3000);

			var selectDeleteBtn = element.all(by.css('[ng-click="vm.deleteFileDialog($event, content.nodeRef)"]')).last();

			browser.driver.manage().window().maximize();

			selectDeleteBtn.click();

			browser.driver.sleep(2500);
			var deleteMemberBtn = element.all(by.css('[aria-label="Slet"]')).first();

			deleteMemberBtn.click();

			browser.driver.sleep(2500);
		});
	};

    return public;
};

module.exports = DeleteDocumentPage();
