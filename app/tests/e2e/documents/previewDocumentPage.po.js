var globalHeaderMenu = require('../common/globalHeader.po.js');
var date = new Date();
var previewedDocument = "";
var previewHeadline = "";
var constants = require('../common/constants');

var PreviewDocumentPage = function () {
    
    var public = {};

	public.getPreviewHeadline = function() {
		return element.all(by.css('h2')).last().getText().then(function(text){
			console.log(text);
			console.log("text");
			return  text;
		});
	}
    
    public.getPreviewedDocument = function() {
    	return previewedDocument;
    }
    public.closeDialog = function() {
    	element(by.css('[aria-label="Luk"]')).click();
    	browser.driver.sleep(2500);
    }
    
    public.previewDocument = function() {

		try {
			element.all(by.repeater('content in contents')).each(function (flap, index) {

				var documentOptionsBtn = flap.all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).first();

				flap.getText().then(function (text) {

					if (text.indexOf(constants.file_2.name) >= 0) {

						documentOptionsBtn.click();
						browser.driver.sleep(2000);

						var selectPreviewBtn = element.all(by.css('[ng-click="vm.previewDocument(content.nodeRef)"]')).last();

						selectPreviewBtn.getText().then(function(text) {
							console.log("selectPreviewBtn " + selectPreviewBtn);
							selectPreviewBtn.click();
						});
					}
				});
			});
		}
		catch (e) {
			console.log("hej");
		}
    };
    
    return public;
};

module.exports = PreviewDocumentPage();