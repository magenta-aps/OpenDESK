var projectList;

var RenameProjectPage = function () {
    
    var public = {};
    
    public.getProjectPageTitle = function() {
        return element(by.css('h1.od-title'));
    }
    
	public.getProjectList = function() {
		projectList = element.all(by.repeater('project in vm.sites'));
	    return projectList;
	}
    
    public.getRenamedProject = function() {
    	return projectRenamed;
    }

	public.showDetails = function() {
		element(by.css('#details')).click();
	}

	public.openEditDialog = function() {
		return element(by.css('[aria-label="Redigér site"]')).click();

	}

	public.editProjectName = function(newName) {
		var projectNameInput = element(by.model('newSite.siteName'));
		projectNameInput.clear();
		projectNameInput.sendKeys(newName);
	}

	public.renameProject = function() {
		var saveBtn = element(by.css('[aria-label="Edit project"] button[type="submit"]'));
		saveBtn.click();
	}
    

    return public;
};

module.exports = RenameProjectPage();
