var globalHeaderMenu = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var date = new Date();
var documentRelocated = "";
var urlToOriginList = "";
var documentList;
var documentOriginList;

var RelocateDocumentPage = function () {
    
    var public = {};
    
    console.log("relocate document");
    
	public.getDocumentList = function() {
		documentList = element.all(by.repeater('content in contents')).getText();
	    return documentList	
	}
    
	public.getDocumentOriginList = function() {
		//documentList = element.all(by.repeater('content in contents')).getText();
	    return documentOriginList	
	}
	
    public.getDocumentRelocated = function() {
    	return documentRelocated;
    }

    public.relocateDocument = function() {



			////go to where document is placed
			//var breadcrumbElmNo = element.all(by.repeater('path in bcPath')).count();
			//breadcrumbElmNo.then(function (count) {
			//	var lastBreadcrumbLink = element.all(by.repeater('path in bcPath')).get(count - 2);
			//	lastBreadcrumbLink.click();
			//});

			//Detect project to copy
			var documentToRelocate = element.all(by.repeater('content in contents')).get(0).getText();
			var documentOptionsBtn = element.all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).first();
			documentRelocated = documentToRelocate;
			documentOptionsBtn.click();

			var selectRelocateBtn = element.all(by.css('[ng-click="vm.moveFileDialog($event, content.nodeRef, content.parentNodeRef)"]')).last().getText();

			selectRelocateBtn.click();

			//var oneLevelBackInFilePath = element.all(by.css('[ng-click="ctrl.browseParent()"]'));
			var oneLevelBackInFilePath = element(by.css('[aria-label="navigate_before"]'));
			oneLevelBackInFilePath.click();

			var selectFirstFolder = element.all(by.css('[ng-click="ctrl.pickNode(dir.nodeRef)"]')).first();
			selectFirstFolder.click();

			//browser.driver.sleep(5000);
			var relocateBtn = element(by.css('[aria-label="Flyt hertil"]'));
			relocateBtn.click();
			browser.driver.sleep(5000);

			//save original list, to validate if relocated document is removed from here
			documentOriginList = element.all(by.repeater('content in contents')).getText();

			//go to location where document is copied
			//breadcrumbElmNo = element.all(by.repeater('path in bcPath')).count();
			//breadcrumbElmNo.then(function (count) {
			//	var lastBreadcrumbLink = element.all(by.repeater('path in bcPath')).get(count - 2);
			//	lastBreadcrumbLink.click();
			//});

		   

			//relocated document is placed in first folder or project
			element.all(by.repeater('content in contents')).get(0).click();


	    	
    }; 
    

    return public;
};

module.exports = RelocateDocumentPage();
