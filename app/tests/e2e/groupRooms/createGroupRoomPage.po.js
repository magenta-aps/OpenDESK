var globalHeaderMenu = require('../common/globalHeader.po.js');
var groupRoomName = '';
var groupRoomList = [];

var CreateGroupRoomPage = function () {

    var public = {};

    public.openCreateGroupRoomDialog = function () {
        return element(by.css('[ng-click="vm.newSite($event)"]')).click();
    }

    public.fillInputFields = function (name, isPrivate) {
        groupRoomName = name;
        var private = isPrivate ? 'privat' : 'offentlig';

        var nameInput = element(by.model('newSiteName'));
        var descriptionInput = element(by.model('newSiteDescription'));
        var privateInput = element(by.model('newSiteIsPrivate'));

        newGroupRoomBtn.click();
        browser.driver.sleep(100);

        nameInput.sendKeys(name);
        descriptionInput.sendKeys("Jeg er en beskrivelse");

        if (isPrivate) {
            privateInput.click();
        }
        browser.driver.sleep(500);
    };

    public.createGroupRoom = function() {
        return element(by.css('[aria-label="create group room"]')).click();
    }
    return public;
};

module.exports = CreateGroupRoomPage();