var globalHeaderMenu = require('../common/globalHeader.po.js');
var oeUtils = require('../common/utils');
var date = new Date();
var projectName;
var projectList;

var CreateProjectPage = function () {
    
    var public = {};
    
	public.getProjectList = function() {
		projectList = element.all(by.repeater('project in vm.sites'));
	    return projectList	
	}
    
    public.getCreatedProject = function() {
    	return projectName;
    }

    public.createProject = function(name,isPrivate) {
        projectName = name;
        var private = isPrivate ? 'privat' : 'offentlig';

        var createProjectDialog = element(by.css('.pd-site-create-form'));
    	var newProjectBtn = element(by.css('[ng-click="pdc.openPdSiteCreateDialog($event)"]'));

        var templateInput = element(by.model('newSite.template.name'));
        var firstTemplate = element(by.css('[value="no-template"]'));
        var projectNameInput = element(by.model('newSite.siteName'));

        var projectOwnerInput = createProjectDialog.element(by.model(['$mdAutocompleteCtrl.scope.searchText']));
        var firstProjectOwner = element(by.css('.md-autocomplete-suggestions li'));
        
        var descriptionInput = element(by.model('newSite.desc'));
        var centerInput = element(by.model('newSite.center_id'));
        var firstCenter = element(by.css('.md-active md-option'));
        var sbsysInput = element(by.model('newSite.sbsys'));
        var privateInput = element(by.model('newSite.isPrivate'));
        var addProjectBtn = element(by.css('[aria-label="Opret projekt"]'));

        newProjectBtn.click();
        browser.driver.sleep(100);
        
        templateInput.click();
        firstTemplate.click();
        projectNameInput.sendKeys(name);

        projectOwnerInput.sendKeys("a");
        firstProjectOwner.click();

        descriptionInput.sendKeys("Jeg er en beskrivelse");

        centerInput.click();
        firstCenter.click();

        sbsysInput.sendKeys("123456");

        if(isPrivate) {
            privateInput.click();
        }
        browser.driver.sleep(1000);
               
        addProjectBtn.click();
    }; 

    public.createGroupRoom = function(name,isPrivate) {
        projectName = name;
        var private = isPrivate ? 'privat' : 'offentlig';

    	var newGroupRoomBtn = element(by.css('[ng-click="vm.newSite($event)"]'));
    	var nameInput = element(by.model('newSiteName'));
        var descriptionInput = element(by.model('newSiteDescription'));
        var privateInput = element(by.model('newSiteIsPrivate'));
        var addBtn = element(by.css('[aria-label="create group room"]'));

        newGroupRoomBtn.click();
        browser.driver.sleep(100);

        nameInput.sendKeys(name+ " grupperum " + private);
        descriptionInput.sendKeys("Jeg er en beskrivelse");

        if(isPrivate) {
            privateInput.click();
        }
        browser.driver.sleep(500);
               
        addBtn.click();
        browser.driver.sleep(1000);
    }; 
    return public;
};

module.exports = CreateProjectPage();
// module.exports = CreateGroupRoom();
