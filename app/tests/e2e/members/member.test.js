
var globalHeader = require('../common/globalHeader.po.js');
var constants = require('../common/constants');
var addMemberPage = require('./addMemberPage.po.js');
var removeMemberPage = require('./removeMemberPage.po.js');
var updateMemberPage = require('./updateMemberPage.po.js');
var loginPage = require('../login/loginPage.po.js');

describe('openESDH login page', function() {




    //it('should be able to remove a memeber', function() {
    //
    //    loginPage.loginAsAdmin();
    //
    //});


    it('should be able to remove a memeber', function() {


        browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {

            removeMemberPage.removeMember(constants.PROJECT_NAME_1_MEMBER1.fullname);

            expect(addMemberPage.getMembers().getText()).not.toMatch(constants.PROJECT_NAME_1_MEMBER1.fullname);
        });

    });

    it('should be able to add a memeber', function() {


        browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {

            addMemberPage.addMember(constants.PROJECT_NAME_1, constants.PROJECT_NAME_1_MEMBER1.name, constants.PROJECT_NAME_1_MEMBER1.role);

            expect(addMemberPage.getMembers().getText()).toMatch(constants.PROJECT_NAME_1_MEMBER1.fullname);
        });

    });



    it('should be able to remove a memeber', function() {


        browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {

            updateMemberPage.updateMember();

            expect(updateMemberPage.getMember().getOuterHtml()).toMatch(constants.role_for_update_member);
        });

    });



});