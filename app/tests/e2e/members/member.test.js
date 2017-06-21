
var constants = require('../common/constants');
var projectHelper = require('../projects/projectHelper.js');
var memberHelper = require('./memberHelper.js');
var addMemberPage = require('./addMemberPage.po.js');
var deleteMemberPage = require('./deleteMemberPage.po.js');

describe('OpenDesk members', function() {

    it('should go to the default project', function () {
        projectHelper.openDefaultProject();
    }),

    describe('Project group', function() {
        it('should be able to add a new member', function() {
            memberHelper.openAddMemberDialog();
            memberHelper.unfoldProjectGroup();
            memberHelper.addProjectMember();
            browser.driver.sleep(1000);
            //addMemberPage.fillInputFields();
            memberHelper.update();
        })
    });
});

    // it('should be able to remove a memeber', function() {


    //     browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {

    //         removeMemberPage.removeMember(constants.PROJECT_NAME_1_MEMBER1.fullname);

    //         expect(addMemberPage.getMembers().getText()).not.toMatch(constants.PROJECT_NAME_1_MEMBER1.fullname);
    //     });

    // });

    // it('should be able to add a memeber', function() {


    //     browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {

    //         addMemberPage.addMember(constants.PROJECT_NAME_1, constants.PROJECT_NAME_1_MEMBER1.name, constants.PROJECT_NAME_1_MEMBER1.role);

    //         expect(addMemberPage.getMembers().getText()).toMatch(constants.PROJECT_NAME_1_MEMBER1.fullname);
    //     });

    // });



    // it('should be able to remove a memeber', function() {


    //     browser.get("http://localhost:8000/#/projekter/" + constants.PROJECT_NAME_1).then (function(response) {

    //         updateMemberPage.updateMember();

    //         expect(updateMemberPage.getMember().getOuterHtml()).toMatch(constants.role_for_update_member);
    //     });

    // });
