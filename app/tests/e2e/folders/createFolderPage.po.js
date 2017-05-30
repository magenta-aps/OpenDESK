var globalHeaderMenu = require('../common/globalHeader.po.js');
var loginPage = require('../login/loginPage.po.js');
var constants = require('../common/constants');
var date = new Date();
var folderName = constants.folder_to_be_created_and_deleted;
var folderList;

var CreateFolderPage = function () {
    
    var public = {};
    
    console.log("create new folder");
    
	public.getFolderList = function() {
		folderList = element.all(by.repeater('content in contents'));
	    return folderList	
	}
    
    public.getCreatedFolder = function() {
    	return folderName;
    }

    public.createFolder = function() {
    	

    	var folderNameInput = element(by.model('newFolderName'));
    	var addFolderBtn = element(by.css('[aria-label="Tilføj"]'));
    	

    	newFolderBtn = element(by.css('[ng-click="vm.newFolderDialog($event)"]'));
    	
    	newFolderBtn.click();
    	browser.driver.sleep(500);
    	
    	folderNameInput.sendKeys(folderName);
    	
    	addFolderBtn.click();

		browser.driver.navigate().refresh();

		browser.driver.sleep(1000);


    }; 
    

    return public;
};

module.exports = CreateFolderPage();
