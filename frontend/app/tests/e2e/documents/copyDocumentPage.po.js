var globalHeaderMenu = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var date = new Date();
var documentCopied = "";
var documentList;

var CopyDocumentPage = function () {
    
    var public = {};
    

	public.getDocumentList = function() {
		documentList = element.all(by.repeater('content in contents')).getText();
	    return documentList	
	}
    
    public.getDocumentCopied = function() {
    	return documentCopied;
    }

    public.copyDocument = function() {
    	

	    	var documentToCopy = element.all(by.repeater('content in contents')).get(0).getText();


	    	var documentOptionsBtn = element.all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).first();
	    	documentCopied = documentToCopy;
	    	documentOptionsBtn.click();

	    	var selectCopyBtn = element.all(by.css('[ng-click="vm.copyFileDialog($event, content.nodeRef, content.parentNodeRef)"]')).last().getText();

	    	selectCopyBtn.click();

	    	//var oneLevelBackInFilePath = element.all(by.css('[ng-click="ctrl.browseParent()"]'));
	    	var oneLevelBackInFilePath = element(by.css('[aria-label="navigate_before"]'));
	    	oneLevelBackInFilePath.click();
	    	//browser.driver.sleep(5000);
	    	var selectFirstFolder = element.all(by.css('[ng-click="ctrl.pickNode(dir.nodeRef)"]')).first();
	    	selectFirstFolder.click();

	    	var copyBtn = element(by.css('[aria-label="Kopiér hertil"]'));
	    	copyBtn.click();
    };
    

    return public;
};

module.exports = CopyDocumentPage();
