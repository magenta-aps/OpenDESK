var globalHeaderMenu = require('../common/globalHeader.po.js');
var deletedFolderName;
var folderList;
var constants = require('../common/constants');


var DeleteFolderPage = function () {
    
    var public = {};
    
    console.log("delete");
    
	public.getFolderList = function() {
		folderList = element.all(by.repeater('content in contents'));
	    return folderList	
	}
    
    public.getDeletedFolder = function() {
    	return deletedFolderName;
    }


    public.deleteFolder = function() {

        'use strict';
        //Select all date elements and apply filter function
        element.all(by.repeater('content in contents')).filter(function (elem) {
            //Return the element or elements
            return elem.getText().then(function (text) {
                //Match the text
                console.log(text);

                return text.indexOf(constants.folder_to_be_created_and_deleted) >= 0;
            });
        }).then(function (filteredElements) {
            //filteredElements is the list of filtered elements

            console.log(filteredElements[0].getInnerHtml().then (function(val) {
                console.log(val);
            }));

            var documentOptionsBtn = filteredElements[0].all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).last();

            documentOptionsBtn.click();

            browser.driver.sleep(2000);


            var selectdeleteBtn = element.all(by.css('[ng-click="vm.deleteFoldereDialog($event, content.nodeRef)"]')).last()
            selectdeleteBtn.click();

            browser.driver.sleep(2000);

            var deleteProjectBtn = element(by.css('[aria-label="Slet"]'));
            deleteProjectBtn.click();

            browser.driver.sleep(2000);
        });
    };

    return public;
};

module.exports = DeleteFolderPage();
