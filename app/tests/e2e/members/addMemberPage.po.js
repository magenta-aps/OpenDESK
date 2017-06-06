var globalHeaderMenu = require('../common/globalHeader.po.js');

var AddMemberPage = function () {
    
    var public = {};


    public.getMembers = function() {

        var result =  element.all(by.repeater('member in members'));

        return result;
    }


    public.openAddMemberDialog = function () {
        var newMemberBtn = element(by.css('[aria-label="Tilføj gruppemedlemmer"]'));

        newMemberBtn.click();

    }

    public.fillInputFields = function() {

    }

    public.addMember = function() {
        return element(by.css('[aria-label="Add and remove members"] button[type="submit"]')).click();
    }

    return public;
};

module.exports = AddMemberPage();
