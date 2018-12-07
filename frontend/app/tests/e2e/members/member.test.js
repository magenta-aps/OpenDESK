// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var constants = require('../common/constants');
var projectHelper = require('../projects/projectHelper.js');
var memberHelper = require('./memberHelper.js');
var addMemberPage = require('./addMemberPage.po.js');
var deleteMemberPage = require('./deleteMemberPage.po.js');

describe('OpenDesk members', function () {

    it('should go to the default project', function () {
            projectHelper.openDefaultProject();
        }),

        describe('Project group', function () {
            it('should be able to add a new member', function () {
                memberHelper.openAddMemberDialog();
                memberHelper.unfoldProjectGroup();
                addMemberPage.fillInputFields(constants.MEMBER_SEARCH);
                memberHelper.update();
                memberHelper.unfoldProjectGroupList();
                memberHelper.findMemberInProjectList(constants.MEMBER_ADDED).then(function (response) {
                    expect(response.length).toBe(1);
                });
            });

            it('should be able to delete a member', function () {
                memberHelper.openAddMemberDialog();
                //memberHelper.unfoldProjectGroup();
                deleteMemberPage.findChipForMember(constants.MEMBER_DELETED).then( function(response) {
                    expect(response.length).toBe(1);
                    deleteMemberPage.deleteChip(response[0]);
                });
                memberHelper.update();
                //memberHelper.unfoldProjectGroupList();
                memberHelper.findMemberInProjectList(constants.MEMBER_DELETED).then(function (response) {
                     expect(response.length).toBe(0);
                });
            });
        });
        
    it('should go back to project list', function () {
        projectHelper.backToProjects();
    });
});