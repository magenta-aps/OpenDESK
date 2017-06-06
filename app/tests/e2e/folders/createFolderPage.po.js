var globalHeaderMenu = require('../common/globalHeader.po.js');
var loginPage = require('../login/loginPage.po.js');
var constants = require('../common/constants');
var folderName = constants.folder_to_be_created_and_deleted;
var folderList;

var CreateFolderPage = function () {
    
    var public = {};
    
    console.log("create new folder");
    
	public.getFolderList = function() {
		folderList = element.all(by.repeater('content in contents'));
	    return folderList;
	}
    
    public.getCreatedFolder = function() {
    	return folderName;
    }

	public.openCreateFolderDialog = function() {
		return element(by.css('[aria-label="Create folder"]')).click();
	}

    public.fillInputFields = function() {
    	var folderNameInput = element(by.model('newFolderName'));
    	
    	folderNameInput.sendKeys(folderName);
    }; 

	public.createFolder = function () {
		return element(by.css('[aria-label="New folder"] button[type="submit"]')).click();

	}
    
    return public;
};

module.exports = CreateFolderPage();
