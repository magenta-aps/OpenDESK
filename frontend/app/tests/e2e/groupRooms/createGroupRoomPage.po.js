var globalHeaderMenu = require('../common/globalHeader.po.js');
var groupRoomName = '';
var groupRoomList = [];

var CreateGroupRoomPage = function () {

    var public = {};

    public.openCreateGroupRoomDialog = function () {
        return element(by.css('[aria-label="Create new group room"]')).click();
    }

    public.fillInputFields = function (name, isPrivate) {
        groupRoomName = name;
        var private = isPrivate ? 'privat' : 'offentlig';

        var nameInput = element(by.model('newSite.siteName'));
        var descriptionInput = element(by.model('newSite.desc'));
        var privateInput = element(by.model('newSite.isPrivate'));

        //newGroupRoomBtn.click();
        browser.driver.sleep(100);

        nameInput.sendKeys(name);
        descriptionInput.sendKeys("Jeg er en beskrivelse");

        if (isPrivate) {
            privateInput.click();
        }
        browser.driver.sleep(500);
    };

    public.createGroupRoom = function() {
        return element(by.css('[aria-label="Create"]')).click();
    }
    return public;
};

module.exports = CreateGroupRoomPage();