var globalHeaderMenu = require('../common/globalHeader.po.js');
var deletedProjectName;
var projectList;
var constants = require('../common/constants');

var BreakException = {};


var DeleteProjectPage = function () {
    
    var public = {};
    
    console.log("delete1");
    
	public.getProjectList = function() {


            projectList = element.all(by.repeater('project in vm.sites'));
            return projectList

	}
    
    public.getDeletedProject = function() {
    	return deletedProjectName;
    }

    public.deleteProject = function(tileText) {

            'use strict';
            //Select all date elements and apply filter function
            element.all(by.repeater('project in vm.sites')).filter(function (elem) {
                //Return the element or elements
                return elem.getText().then(function (text) {
                    //Match the text

                    console.log(text);

                    return text.indexOf(constants.PROJECT_NAME_create_delete) >= 0;
                });
            }).then(function (filteredElements) {
                //filteredElements is the list of filtered elements

                var documentOptionsBtn = filteredElements[0].all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).first();

                documentOptionsBtn.click();
                browser.driver.sleep(5000);

                var selectDeleteBtn = element.all(by.css('[ng-click="vm.deleteSiteDialog(project.shortName)"]')).last();
                var deleteProjectBtn = element.all(by.css('[aria-label="Ja"]'));

                selectDeleteBtn.click();
                browser.driver.sleep(2000);

                deleteProjectBtn.click();
                browser.driver.sleep(2000);
            });
    };

    return public;
};

module.exports = DeleteProjectPage();
