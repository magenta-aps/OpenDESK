var globalHeaderMenu = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var date = new Date();

var projectList;
var constants = require('../common/constants');

var RenameProjectPage = function () {
    
    var public = {};
    
    console.log("create_rename");
    
	public.getProjectList = function() {
		projectList = element.all(by.repeater('project in vm.sites'));
	    return projectList	
	}
    
    public.getRenamedProject = function() {
    	return projectRenamed;
    }

    public.renameProject = function() {

			'use strict';
			//Select all date elements and apply filter function
			element.all(by.repeater('project in vm.sites')).filter(function (elem) {
				//Return the element or elements
				return elem.getText().then(function (text) {
					console.log(text);

					//Match the text

					return text.indexOf(constants.PROJECT_NAME_RENAME) >= 0;
				});
			}).then(function (filteredElements) {

				console.log("filteret elements")
				console.log(filteredElements)
				//filteredElements is the list of filtered elements

				var documentOptionsBtn = filteredElements[0].all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).first();

				var selectRenameBtn = element.all(by.css('[ng-click="vm.renameSiteDialog($event, project)"]')).last();
				var renameInput = element(by.model('newSiteName'));
				var renameProjectBtn = element(by.css('[aria-label="Tilføj"]'));

				documentOptionsBtn.click();
				browser.driver.sleep(2000);
				console.log("click1");

				browser.driver.sleep(500);

				selectRenameBtn.click();
				console.log("click2");

				browser.driver.sleep(500);

				renameInput.clear();
				renameInput.sendKeys(constants.PROJECT_NAME_RENAME_NEW_NAME);

				renameProjectBtn.click();
				console.log("click3");

				browser.driver.sleep(500);
			});
    };
    

    return public;
};

module.exports = RenameProjectPage();
