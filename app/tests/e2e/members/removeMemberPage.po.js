var globalHeaderMenu = require('../common/globalHeader.po.js');
var constants = require('../common/constants');

var RemoveMemberPage = function () {
    
    var public = {};


    public.getMembers = function() {

        var result =  element.all(by.repeater('member in members'));

        return result
    }

    public.removeMember = function() {



        'use strict';
        //Select all date elements and apply filter function
        element.all(by.repeater('member in members')).filter(function (elem) {
            //Return the element or elements
            return elem.getText().then(function (text) {
                //Match the text
                return text.indexOf(constants.PROJECT_NAME_1_MEMBER1.fullname) >= 0;
            });
        }).then(function (filteredElements) {

            browser.driver.sleep(1000);

            var documentOptionsBtn = filteredElements[0].all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).first();

            documentOptionsBtn.click();
            browser.driver.sleep(1000);

            var selectDeleteBtn = element.all(by.css('[ng-click="vm.deleteMemberDialog(vm.project, member.authority.userName);"]')).last();

            browser.driver.manage().window().maximize();

            selectDeleteBtn.click();

            browser.driver.sleep(1500);
            var deleteMemberBtn = element.all(by.css('[aria-label="Slet"]')).first();

            deleteMemberBtn.click();

            browser.driver.sleep(1500);
        });
    };

    return public;
};

module.exports = RemoveMemberPage();
