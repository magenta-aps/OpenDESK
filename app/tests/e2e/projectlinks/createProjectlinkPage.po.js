var globalHeaderMenu = require('../common/globalHeader.po.js');
var constants = require('../common/constants');

var CreateProjectlinkPage = function () {

	return {

		openCreateProjectlinkDialog: function () {
			return element(by.css('[aria-label="Create project link"]')).click();
		},

		fillInputFields: function (input) {
			var projectInput = element(by.css('[aria-label="Choose project"]'));
			var firstProject = element(by.css('.md-autocomplete-suggestions li'));

			projectInput.sendKeys(input);
			firstProject.click();
		},

		createProjectlink: function () {
			return element(by.css('[aria-label="Create project link"] button[type="submit"]')).click();
		}
	}
};

module.exports = CreateProjectlinkPage();