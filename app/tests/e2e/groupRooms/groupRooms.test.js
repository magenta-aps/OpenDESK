var globalHeader = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var loginPage = require('../login/loginPage.po.js');
var createGroupRoom = require('./createGroupRoomPage.po.js');


describe('openDESK login', function() {
    it('should login', function() {
        loginPage.loginAsAdmin();
    });
});

describe('public group rooms', function() {
    it('should be able to be created', function() {
        createGroupRoom.openCreateGroupRoomDialog();
        createGroupRoom.fillInputFields(constants.PROJECT_NAME_2,false);
        createGroupRoom.createGroupRoom();
    });

    xit('should be able to be deleted', function() {
        return browser.get("http://localhost:8000/#!/projekter").then (function(response) {
            deleteProjectPage.deleteProject(constants.PROJECT_NAME_2);
        });
    });
});

describe('openDESK logout', function() {
    it('should logout', function() {
        loginPage.logout();
    });
});