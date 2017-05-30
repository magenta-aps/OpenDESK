var globalHeaderMenu = require('../common/globalHeader.po.js');
var oeUtils = require('../common/utils');
var date = new Date();
var projectName;
var projectList;

var CreateProjectPage = function () {
    
    var public = {};
    
    console.log("create");
    
	public.getProjectList = function() {
		projectList = element.all(by.repeater('project in vm.sites'));
	    return projectList	
	}
    
    public.getCreatedProject = function() {
    	return projectName;
    }

    public.createProject = function(name) {
        console.log("create2");
        projectName = name;

        // oeUtils.emptyTrashcan();

        console.log(element.all);

    	var newProjectBtn = element(by.css('[ng-click="vm.newSite($event)"]'));
    	var projectNameInput = element(by.model('newSiteName'));
        var descriptionInput = element(by.model('newSiteDescription'));
        var addProjectBtn = element(by.css('[aria-label="Tilføj"]'));

        newProjectBtn.click();
        
        projectNameInput.sendKeys(name);
        descriptionInput.sendKeys("Jeg er overflødig");
               
        addProjectBtn.click();
        browser.driver.sleep(1000);
    }; 
    

    return public;
};

module.exports = CreateProjectPage();
