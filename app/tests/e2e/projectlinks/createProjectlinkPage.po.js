var globalHeaderMenu = require('../common/globalHeader.po.js');
var loginPage = require('../login/loginPage.po.js');
var constants = require('../common/constants');
var folderName = constants.folder_to_be_created_and_deleted;
var folderList;

var CreateProjectlinkPage = function () {
    
    var public = {};

	public.openCreateProjectlinkDialog = function() {
		return element(by.css('[aria-label="Create project link"]')).click();
	}

    public.fillInputFields = function() {
    	var projectInput = element(by.css('[aria-label="Choose project"]'));
        var firstProject = element(by.css('.md-autocomplete-suggestions li'));
    	
    	projectInput.sendKeys('sa');
        firstProject.click();
    }; 

	public.createProjectlink = function () {
		return element(by.css('[aria-label="New project link"] button[type="submit"]')).click();

	}
    
    return public;
};

module.exports = CreateProjectlinkPage();
