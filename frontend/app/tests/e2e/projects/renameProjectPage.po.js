var RenameProjectPage = function () {

	return {

		showDetails: function () {
			element(by.css('#details')).click();
		},

		openEditDialog: function () {
			return element(by.css('[aria-label="Redigér site"]')).click();
		},

		editProjectName: function (newName) {
			var projectNameInput = element(by.model('newSite.siteName'));
			projectNameInput.clear();
			projectNameInput.sendKeys(newName);
		},

		renameProject: function () {
			var saveBtn = element(by.css('[aria-label="Edit project"] button[type="submit"]'));
			saveBtn.click();
		}
	}
};

module.exports = RenameProjectPage();
