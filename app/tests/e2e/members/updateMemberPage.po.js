var globalHeaderMenu = require('../common/globalHeader.po.js');
var constants = require('../common/constants');

var UpdateMemberPage = function () {
    
    var public = {};


    public.getMember = function() {

        'use strict';
        //Select all date elements and apply filter function
        return element.all(by.repeater('member in members')).filter(function (elem) {
            //Return the element or elements
            return elem.getText().then(function (text) {
                //Match the text
                return text.indexOf(constants.PROJECT_NAME_1_MEMBER1.fullname) >= 0;
            });
        })
    }

    public.updateMember = function() {

        'use strict';
        //Select all date elements and apply filter function
        element.all(by.repeater('member in members')).filter(function (elem) {
            //Return the element or elements
            return elem.getText().then(function (text) {
                //Match the text
                return text.indexOf(constants.PROJECT_NAME_1_MEMBER1.fullname) >= 0;
            });
        }).then(function (filteredElements) {

            var documentOptionsBtn = filteredElements[0].all(by.css('[ng-click="vm.openMenu($mdOpenMenu, $event)"]')).first();

            documentOptionsBtn.click();
            browser.driver.sleep(1000);

            var selectUpdateBtn = element.all(by.css('[ng-click="vm.updateMemberRoleDialog($event, member.authority)"]')).last();

            browser.driver.manage().window().maximize();

            selectUpdateBtn.click();

            browser.driver.sleep(1000);

            var addMemberRole_element = element(by.model('newMemberRole'));

            browser.sleep(1500);


            addMemberRole_element.sendKeys(constants.role_for_update_member);

            browser.driver.sleep(2500);
            var deleteMemberBtn = element.all(by.css('[aria-label="Update"]')).first();

            deleteMemberBtn.click();

            browser.driver.sleep(2500);


        });
    };

    return public;
};

module.exports = UpdateMemberPage();
