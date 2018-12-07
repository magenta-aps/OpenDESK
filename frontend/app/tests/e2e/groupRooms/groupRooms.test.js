// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var constants = require('../common/constants');
var projectHelper = require('../projects/projectHelper.js');
var createGroupRoom = require('./createGroupRoomPage.po.js');
var renameGroupRoomPage = require('./renameGroupRoomPage.po.js');
var deleteGroupRoomPage = require('./deleteGroupRoomPage.po.js');

describe('new group room', function () {
    it('should create a new group room', function () {
        createGroupRoom.openCreateGroupRoomDialog();
        createGroupRoom.fillInputFields(constants.GROUPROOM_NAME, false);
        createGroupRoom.createGroupRoom();
    });

    it('should rename the group room', function () {
        renameGroupRoomPage.showDetails();
        renameGroupRoomPage.openEditDialog();
        renameGroupRoomPage.editGroupRoomName(constants.GROUPROOM_NAME_RENAME);
        renameGroupRoomPage.renameGroupRoom();
        expect(projectHelper.getProjectPageTitle()).toMatch(constants.GROUPROOM_NAME_RENAME);
    });
});

describe('back to project list', function () {
    it('should go back to project list', function () {
        projectHelper.backToProjects();
        expect(browser.getCurrentUrl()).toContain('/projekter');
    });

    it('should delete group room', function () {
        projectHelper.findProjectInList(constants.GROUPROOM_NAME_RENAME).then(function (filteredElements) {
            expect(filteredElements.length).toBe(1);
        });

        deleteGroupRoomPage.deleteGroupRoom(constants.GROUPROOM_NAME_RENAME);
        browser.driver.sleep(1000);

        projectHelper.findProjectInList(constants.GROUPROOM_NAME_RENAME).then(function (filteredElements) {
            expect(filteredElements.length).toBe(0);
        });
    });
});